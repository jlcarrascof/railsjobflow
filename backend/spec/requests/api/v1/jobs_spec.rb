# spec/requests/api/v1/jobs_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::Jobs', type: :request do
  let(:application) do
    Doorkeeper::Application.create!(
      name: 'Test App',
      redirect_uri: '',
      scopes: ''
    )
  end

  let(:token) do
    Doorkeeper::AccessToken.create!(
      application: application,
      scopes: ''
    ).token
  end

  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'POST /api/v1/jobs' do
    context 'without authentication' do
      it 'returns 401 unauthorized' do
        post '/api/v1/jobs', params: { title: 'Test' }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with valid Bearer token' do
      it 'creates job and returns 202 accepted' do
        post '/api/v1/jobs',
          params: { title: 'Test Job', payload: { data: 'test' } },
          headers: auth_headers

        expect(response).to have_http_status(:accepted)
        json = JSON.parse(response.body)
        expect(json['status']).to eq('pending')
        expect(json['title']).to eq('Test Job')
      end

      it 'respects X-Idempotency-Key header' do
        key = SecureRandom.uuid
        headers = auth_headers.merge('X-Idempotency-Key' => key)

        post '/api/v1/jobs', params: { title: 'Test' }, headers: headers
        expect(response).to have_http_status(:accepted)
        first_id = JSON.parse(response.body)['id']

        WorkflowJob.find(first_id).mark_completed!

        post '/api/v1/jobs', params: { title: 'Test Duplicate' }, headers: headers
        expect(response).to have_http_status(:accepted)
        second_id = JSON.parse(response.body)['id']

        expect(first_id).to eq(second_id)
      end
    end

    context 'with invalid token' do
      it 'returns 401 unauthorized' do
        post '/api/v1/jobs',
          params: { title: 'Test' },
          headers: { 'Authorization' => 'Bearer invalid_token' }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/jobs/:id' do
    it 'returns job with observability fields' do
      job = create(:workflow_job, :completed)

      get "/api/v1/jobs/#{job.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('completed')
      expect(json['duration_ms']).to be_present
    end

    it 'includes the full payload for the job detail view' do
      job = create(:workflow_job, payload: { 'amount' => 100, 'currency' => 'USD' })

      get "/api/v1/jobs/#{job.id}", headers: auth_headers

      json = JSON.parse(response.body)
      expect(json['payload']).to eq({ 'amount' => 100, 'currency' => 'USD' })
    end

    it 'returns 404 if job does not exist' do
      get '/api/v1/jobs/000000000000000000000000', headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH /api/v1/jobs/:id/cancel' do
    it 'cancels a pending job' do
      job = create(:workflow_job)

      patch "/api/v1/jobs/#{job.id}/cancel", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('cancelled')
    end

    it 'refuses to cancel a running job' do
      job = create(:workflow_job, :running)

      patch "/api/v1/jobs/#{job.id}/cancel", headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(job.reload.status).to eq('running')
    end

    it 'returns 404 if job does not exist' do
      patch '/api/v1/jobs/000000000000000000000000/cancel', headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'Rate limiting' do
    it 'configures Rack::Attack throttle rule for api/token' do
      expect(Rack::Attack.throttles).to have_key('api/token')
    end
  end
end
