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

  describe 'GET /api/v1/jobs' do
    it 'returns paginated jobs with pagination metadata' do
      create_list(:workflow_job, 3)

      get '/api/v1/jobs', params: { page: 1, per_page: 2 }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['jobs'].size).to eq(2)
      expect(json['pagination']).to include(
        'page' => 1, 'per_page' => 2, 'total_count' => 3, 'total_pages' => 2
      )
    end

    it 'returns the second page correctly' do
      create_list(:workflow_job, 3)

      get '/api/v1/jobs', params: { page: 2, per_page: 2 }, headers: auth_headers

      json = JSON.parse(response.body)
      expect(json['jobs'].size).to eq(1)
      expect(json['pagination']['page']).to eq(2)
    end

    it 'defaults to page 1 and per_page 25 when not specified' do
      create_list(:workflow_job, 3)

      get '/api/v1/jobs', headers: auth_headers

      json = JSON.parse(response.body)
      expect(json['jobs'].size).to eq(3)
      expect(json['pagination']).to include('page' => 1, 'per_page' => 25)
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

  describe 'POST /api/v1/jobs/:id/retry' do
    it 'retries a failed job, resetting it to pending' do
      job = create(:workflow_job, :failed)

      post "/api/v1/jobs/#{job.id}/retry", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('pending')
      expect(json['retries']).to eq(1)
      expect(json['error_message']).to be_nil
    end

    it 'refuses to retry a job that has not failed' do
      job = create(:workflow_job, :completed)

      post "/api/v1/jobs/#{job.id}/retry", headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(job.reload.status).to eq('completed')
    end

    it 'returns 404 if job does not exist' do
      post '/api/v1/jobs/000000000000000000000000/retry', headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'Rate limiting' do
    it 'configures Rack::Attack throttle rule for api/token' do
      expect(Rack::Attack.throttles).to have_key('api/token')
    end
  end
end
