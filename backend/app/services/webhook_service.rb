# app/services/webhook_service.rb
require 'net/http'
require 'openssl'
require 'uri'

# Service executing HTTP webhook delivery with HMAC-SHA256 cryptographic payload signing
class WebhookService
  def self.call(job:, endpoint_url:, secret:)
    new(job: job, endpoint_url: endpoint_url, secret: secret).call
  end

  def initialize(job:, endpoint_url:, secret:)
    @job = job
    @endpoint_url = endpoint_url
    @secret = secret
  end

  def call
    return Result.failure("No webhook URL configured") if @endpoint_url.blank?

    payload = build_payload
    signature = sign_payload(payload)

    begin
      response = deliver_webhook(payload, signature)

      Rails.logger.info({
        event: 'webhook_delivered',
        job_id: @job.id.to_s,
        status: response.code,
        endpoint: @endpoint_url
      }.to_json)

      Result.success({ status: response.code.to_i, body: response.body })

    rescue => e
      Rails.logger.error({
        event: 'webhook_failed',
        job_id: @job.id.to_s,
        error: e.message,
        endpoint: @endpoint_url
      }.to_json)

      Result.failure(e.message)
    end
  end

  private

  def build_payload
    {
      event: 'job.completed',
      job_id: @job.id.to_s,
      title: @job.title,
      status: @job.status,
      duration_ms: @job.duration_ms,
      completed_at: @job.completed_at&.iso8601,
      timestamp: Time.current.iso8601
    }
  end

  def sign_payload(payload)
    # HMAC-SHA256 digest signature ensuring data integrity in transit
    digest = OpenSSL::HMAC.hexdigest(
      OpenSSL::Digest.new('sha256'),
      @secret.to_s,
      payload.to_json
    )
    "sha256=#{digest}"
  end

  def deliver_webhook(payload, signature)
    uri = URI(@endpoint_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    http.open_timeout = 5
    http.read_timeout = 10

    request = Net::HTTP::Post.new(uri.path.presence || '/')
    request['Content-Type'] = 'application/json'
    request['X-Webhook-Signature'] = signature
    request['X-Webhook-Event'] = 'job.completed'
    request.body = payload.to_json

    http.request(request)
  end
end
