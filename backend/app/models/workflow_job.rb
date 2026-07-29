# app/models/workflow_job.rb
class WorkflowJob
  include Mongoid::Document
  include Mongoid::Timestamps

  # Model fields - defines document structure in MongoDB
  field :title,           type: String
  field :status,          type: String,   default: 'pending'
  field :payload,         type: Hash,     default: {}
  field :idempotency_key, type: String
  field :retries,         type: Integer,  default: 0
  field :max_retries,     type: Integer,  default: 3
  field :error_message,   type: String
  field :started_at,      type: DateTime
  field :completed_at,    type: DateTime
  field :failed_at,       type: DateTime
  field :duration_ms,     type: Integer

  # Database indexes for fast querying and idempotency enforcement
  index({ idempotency_key: 1 }, { unique: true, sparse: true })
  index({ status: 1 })
  index({ created_at: -1 })

  # Validations
  validates :title, presence: true
  validates :status, inclusion: {
    in: %w[pending running completed failed],
    message: "%{value} is not a valid status"
  }
  validates :idempotency_key,
    uniqueness: { message: "a job with this idempotency key already exists" },
    allow_blank: true

  # Scopes
  scope :pending,   -> { where(status: 'pending') }
  scope :running,   -> { where(status: 'running') }
  scope :completed, -> { where(status: 'completed') }
  scope :failed,    -> { where(status: 'failed') }
  scope :recent,    -> { order(created_at: :desc) }

  # Helper methods for status transitions
  def mark_running!
    update!(status: 'running', started_at: Time.current)
  end

  def mark_completed!
    duration = started_at ? ((Time.current - started_at) * 1000).round : nil
    update!(status: 'completed', completed_at: Time.current, duration_ms: duration)
  end

  def mark_failed!(error_message = nil)
    update!(
      status: 'failed',
      failed_at: Time.current,
      error_message: error_message
    )
  end

  def increment_retries!
    inc(retries: 1)
  end
end
