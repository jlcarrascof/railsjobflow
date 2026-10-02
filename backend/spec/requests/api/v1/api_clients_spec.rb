# spec/requests/api/v1/api_clients_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::ApiClients', type: :request do
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

  describe 'GET /api/v1/api_clients' do
    it 'lists all registered api clients' do
      ApiClient.create!(name: 'Client One')
      ApiClient.create!(name: 'Client Two')

      get '/api/v1/api_clients', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
      expect(json.map { |c| c['name'] }).to contain_exactly('Client One', 'Client Two')
    end
  end

  describe 'POST /api/v1/api_clients' do
    it 'creates a new api client with an auto-generated api_key' do
      post '/api/v1/api_clients',
        params: { api_client: { name: 'New Client', webhook_url: 'https://example.com/hook' } },
        headers: auth_headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['name']).to eq('New Client')
      expect(json['api_key']).to be_present
    end

    it 'returns 422 when name is missing' do
      post '/api/v1/api_clients', params: { api_client: { webhook_url: 'https://example.com' } }, headers: auth_headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'PATCH /api/v1/api_clients/:id' do
    it 'updates the webhook_url of an existing client' do
      client = ApiClient.create!(name: 'Existing Client')

      patch "/api/v1/api_clients/#{client.id}",
        params: { api_client: { webhook_url: 'https://example.com/new-hook' } },
        headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['webhook_url']).to eq('https://example.com/new-hook')
    end

    it 'returns 404 if client does not exist' do
      patch '/api/v1/api_clients/000000000000000000000000',
        params: { api_client: { name: 'Nope' } },
        headers: auth_headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
