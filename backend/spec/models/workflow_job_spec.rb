# spec/models/workflow_job_spec.rb
require 'rails_helper'

RSpec.describe WorkflowJob, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_inclusion_of(:status) }
  end

  describe '#mark_running!' do
    it 'updates status to running and sets started_at' do
      job = create(:workflow_job)
      job.mark_running!
      expect(job.reload.status).to eq('running')
      expect(job.started_at).to be_present
    end
  end

  describe '#mark_completed!' do
    it 'updates status to completed and calculates duration' do
      job = create(:workflow_job, :running)
      job.mark_completed!
      expect(job.reload.status).to eq('completed')
      expect(job.duration_ms).to be_present
    end
  end

  describe '#mark_failed!' do
    it 'updates status to failed and records error message' do
      job = create(:workflow_job)
      job.mark_failed!('Timeout error')
      expect(job.reload.status).to eq('failed')
      expect(job.error_message).to eq('Timeout error')
    end
  end

  describe 'idempotency_key uniqueness' do
    it 'prevents duplicate jobs with the same idempotency_key' do
      key = SecureRandom.uuid
      create(:workflow_job, idempotency_key: key)
      duplicate = build(:workflow_job, idempotency_key: key)
      expect(duplicate).not_to be_valid
    end
  end
end
