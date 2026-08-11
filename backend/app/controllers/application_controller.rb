# app/controllers/application_controller.rb
# Base API controller protecting endpoints with Doorkeeper OAuth2 authorization
class ApplicationController < ActionController::API
  before_action :doorkeeper_authorize!

  private

  # Returns current authorized ApiClient associated with the valid Doorkeeper Bearer token
  def current_client
    @current_client ||= ApiClient.find_by(id: doorkeeper_token&.application&.uid)
  rescue
    nil
  end

  # Override Doorkeeper unauthorized response format to render clean 401 JSON
  def doorkeeper_unauthorized_render_options(error: nil)
    { json: { error: 'unauthorized', message: 'Invalid or expired Bearer token' } }
  end
end
