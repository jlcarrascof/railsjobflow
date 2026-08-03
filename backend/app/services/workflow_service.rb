# app/services/workflow_service.rb
# Service Object orchestrating job creation, idempotency validation, and Sidekiq queuing
class WorkflowService
  def self.call(title:, payload: {}, idempotency_key: nil)
    new(title: title, payload: payload, idempotency_key: idempotency_key).call
  end

  def initialize(title:, payload:, idempotency_key:)
    @title = title
    @payload = payload
    @idempotency_key = idempotency_key
  end

  def call
    # Step 1: Check idempotency key before job creation
    if @idempotency_key.present?
      existing = check_idempotency
      return existing if existing
    end

    # Step 2: Build workflow job instance
    job = WorkflowJob.new(
      title: @title,
      payload: @payload,
      idempotency_key: @idempotency_key,
      status: 'pending'
    )

    unless job.valid?
      return Result.failure(job.errors.full_messages.join(', '))
    end

    job.save!

    # Step 3: Enqueue background execution in Sidekiq
    WorkflowWorker.perform_async(job.id.to_s)

    Rails.logger.info({
      event: 'job_enqueued',
      job_id: job.id.to_s,
      idempotency_key: @idempotency_key
    }.to_json)

    Result.success(job)

  rescue Mongoid::Errors::Validations => e
    Result.failure(e.message)
  rescue StandardError => e
    Rails.logger.error({ event: 'job_creation_failed', error: e.message }.to_json)
    Result.failure("Internal error: #{e.message}")
  end

  private

  def check_idempotency
    existing_job = WorkflowJob.where(idempotency_key: @idempotency_key).first
    return nil unless existing_job

    case existing_job.status
    when 'completed'
      # Successfully processed job - return existing record without re-enqueuing
      Rails.logger.info({
        event: 'idempotency_hit',
        job_id: existing_job.id.to_s,
        status: 'completed'
      }.to_json)
      Result.success(existing_job)
    when 'running', 'pending'
      # Job currently in progress - return conflict error
      Result.failure("Job with idempotency_key '#{@idempotency_key}' is already in progress (status: #{existing_job.status})", status: :conflict)
    when 'failed'
      # Previously failed job - allow retry by returning nil to continue creation
      nil
    end
  end
end
