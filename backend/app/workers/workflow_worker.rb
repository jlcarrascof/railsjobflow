# app/workers/workflow_worker.rb
# Sidekiq worker executing background jobs with configurable retries, structured JSON logging, and exhaustion callbacks
class WorkflowWorker
  include Sidekiq::Worker
  include Sidekiq::Status::Worker

  # Configure default queue and 3 retries with exponential backoff
  sidekiq_options queue: 'default', retry: 3

  # Executed when all retries are exhausted (equivalent to Oban's on_failure callback in Elixir)
  sidekiq_retries_exhausted do |job, exception|
    job_id = job['args'].first
    job_record = WorkflowJob.where(_id: job_id).first
    job_record&.mark_failed!("Max retries exhausted: #{exception.message}")

    Rails.logger.error({
      event: 'job_retries_exhausted',
      job_id: job_id,
      error: exception.message
    }.to_json)
  end

  def perform(job_id)
    job = WorkflowJob.where(_id: job_id).first
    return unless job  # Guard clause: job may have been deleted

    Rails.logger.tagged("WorkflowWorker", job_id) do
      Rails.logger.info({ event: 'job_started', status: 'running' }.to_json)

      job.mark_running!
      job.increment_retries! if job.retries > 0

      begin
        # Execute business logic payload
        result = process_payload(job.payload)

        job.mark_completed!
        Rails.logger.info({
          event: 'job_completed',
          duration_ms: job.duration_ms,
          result: result
        }.to_json)

        # Trigger webhook notification upon successful completion
        notify_client_via_webhook(job)

      rescue StandardError => e
        job.mark_failed!(e.message)
        Rails.logger.error({
          event: 'job_failed',
          error: e.message,
          retries: job.retries
        }.to_json)

        # Re-raise exception so Sidekiq handles exponential backoff retry
        raise e
      end
    end
  end

  private

  def process_payload(payload)
    # Business logic simulation - supports forced failure for testing
    raise "Simulated processing error" if payload.is_a?(Hash) && payload['force_fail']

    sleep(0.1)  # Simulate actual processing work
    { processed: true, payload_keys: payload.is_a?(Hash) ? payload.keys : [] }
  end

  def notify_client_via_webhook(job)
    client = ApiClient.where(:webhook_url.ne => nil).first
    return unless client

    WebhookService.call(
      job: job,
      endpoint_url: client.webhook_url,
      secret: client.webhook_secret
    )
  end
end
