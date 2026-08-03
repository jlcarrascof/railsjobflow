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
  end
end
