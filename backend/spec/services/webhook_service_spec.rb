# spec/services/webhook_service_spec.rb
require 'rails_helper'
require 'webmock/rspec'

RSpec.describe WebhookService do
  let(:job) { create(:workflow_job, :completed) }
  let(:secret) { 'webhook-secret-test' }
  let(:endpoint_url) { 'http://example.com/webhooks' }

  describe '.call' do
    context 'when endpoint_url is blank' do
      it 'returns failure with error message' do
        result = described_class.call(job: job, endpoint_url: '', secret: secret)
        expect(result).to be_failure
        expect(result.error).to eq('No webhook URL configured')
      end
    end

    context 'when endpoint_url is valid' do
      it 'signs payload with HMAC-SHA256 and delivers HTTP POST' do
        stub = stub_request(:post, endpoint_url)
          .with(headers: { 'X-Webhook-Event' => 'job.completed' })
          .to_return(status: 200, body: 'ok')

        result = described_class.call(
          job: job,
          endpoint_url: endpoint_url,
          secret: secret
        )

        expect(result).to be_success
        expect(stub).to have_been_requested
      end

      it 'includes X-Webhook-Signature header matching sha256=' do
        stub_request(:post, endpoint_url).to_return(status: 200, body: 'ok')

        described_class.call(job: job, endpoint_url: endpoint_url, secret: secret)

        expect(a_request(:post, endpoint_url).with(
          headers: { 'X-Webhook-Signature' => /^sha256=/ }
        )).to have_been_requested
      end

      it 'returns failure if network timeout occurs' do
        stub_request(:post, endpoint_url).to_timeout

        result = described_class.call(
          job: job,
          endpoint_url: endpoint_url,
          secret: secret
        )

        expect(result).to be_failure
      end
    end
  end
end
