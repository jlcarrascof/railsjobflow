# spec/workers/workflow_worker_spec.rb
require 'rails_helper'

RSpec.describe WorkflowWorker, type: :worker do
  describe '#perform' do
    context 'when job exists and payload is valid' do
      it 'updates status to completed' do
        job = create(:workflow_job)
        described_class.new.perform(job.id.to_s)
        expect(job.reload.status).to eq('completed')
      end

      it 'saves processing duration' do
        job = create(:workflow_job)
        described_class.new.perform(job.id.to_s)
        expect(job.reload.duration_ms).to be_present
      end
    end

    context 'when payload has force_fail: true' do
      it 'marks job as failed and records error' do
        job = create(:workflow_job, payload: { 'force_fail' => true })

        expect {
          described_class.new.perform(job.id.to_s)
        }.to raise_error(RuntimeError, /Simulated processing error/)

        expect(job.reload.status).to eq('failed')
        expect(job.reload.error_message).to be_present
      end
    end

    context 'when job does not exist' do
      it 'returns without error (guard clause)' do
        expect {
          described_class.new.perform('000000000000000000000000')
        }.not_to raise_error
      end
    end

    context 'webhook notification targeting' do
      it 'notifies the api_client associated with the job, not an arbitrary one' do
        decoy = ApiClient.create!(name: 'Decoy Client', webhook_url: 'https://decoy.example.com/hook')
        owner = ApiClient.create!(name: 'Owner Client', webhook_url: 'https://owner.example.com/hook')
        job = create(:workflow_job, api_client_id: owner.id.to_s)

        expect(WebhookService).to receive(:call).with(
          hash_including(endpoint_url: owner.webhook_url, secret: owner.webhook_secret)
        )

        described_class.new.perform(job.id.to_s)

        expect(decoy).to be_present # sanity: decoy exists but is never targeted
      end

      it 'does not send a webhook when the job has no api_client_id' do
        job = create(:workflow_job, api_client_id: nil)

        expect(WebhookService).not_to receive(:call)

        described_class.new.perform(job.id.to_s)
      end
    end
  end
end
