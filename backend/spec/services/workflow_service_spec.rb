# spec/services/workflow_service_spec.rb
require 'rails_helper'

RSpec.describe WorkflowService do
  describe '.call' do
    context 'when new job without idempotency_key' do
      it 'creates job in database and enqueues in Sidekiq' do
        expect {
          result = described_class.call(title: 'Test Job', payload: { data: 'test' })
          expect(result).to be_success
          expect(result.value.title).to eq('Test Job')
        }.to change(WorkflowJob, :count).by(1)

        expect(WorkflowWorker.jobs.size).to eq(1)
      end
    end

    context 'with idempotency_key - completed job' do
      it 'returns existing job without creating a new record' do
        key = SecureRandom.uuid
        existing = create(:workflow_job, :completed, idempotency_key: key)

        expect {
          result = described_class.call(
            title: 'Duplicate Job',
            idempotency_key: key
          )
          expect(result).to be_success
          expect(result.value.id).to eq(existing.id)
        }.not_to change(WorkflowJob, :count)
      end
    end

    context 'with idempotency_key - job in progress' do
      it 'returns failure with conflict message' do
        key = SecureRandom.uuid
        create(:workflow_job, :running, idempotency_key: key)

        result = described_class.call(title: 'Duplicate', idempotency_key: key)

        expect(result).to be_failure
        expect(result.error).to include('is already in progress')
      end
    end

    context 'with idempotency_key - previously failed job' do
      it 'allows retry by resetting existing job and re-enqueuing' do
        key = SecureRandom.uuid
        existing = create(:workflow_job, :failed, idempotency_key: key)

        expect {
          result = described_class.call(title: 'Retry Job', idempotency_key: key)
          expect(result).to be_success
          expect(existing.reload.status).to eq('pending')
        }.not_to change(WorkflowJob, :count)

        expect(WorkflowWorker.jobs.size).to eq(1)
      end
    end

    context 'with blank title' do
      it 'returns failure with validation errors' do
        result = described_class.call(title: '')
        expect(result).to be_failure
        expect(result.error).to include("Title")
      end
    end
  end
end
