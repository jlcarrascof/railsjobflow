# app/controllers/api/v1/api_clients_controller.rb
module Api
  module V1
    class ApiClientsController < ApplicationController
      def index
        render json: ApiClient.all.map { |c| serialize(c) }
      end

      def create
        client = ApiClient.create!(client_params)
        render json: serialize(client), status: :created
      rescue Mongoid::Errors::Validations => e
        render json: { error: e.message }, status: :unprocessable_content
      end

      def update
        client = ApiClient.find(params[:id])
        client.update!(client_params)
        render json: serialize(client), status: :ok
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Api client not found' }, status: :not_found
      rescue Mongoid::Errors::Validations => e
        render json: { error: e.message }, status: :unprocessable_content
      end

      private

      def client_params
        params.require(:api_client).permit(:name, :webhook_url)
      end

      def serialize(client)
        {
          id: client.id.to_s,
          name: client.name,
          api_key: client.api_key,
          webhook_url: client.webhook_url,
          webhook_secret: client.webhook_secret
        }
      end
    end
  end
end
