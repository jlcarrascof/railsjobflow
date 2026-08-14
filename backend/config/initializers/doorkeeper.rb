# config/initializers/doorkeeper.rb
# Doorkeeper OAuth2 server configuration adapted for Mongoid ORM and client_credentials grant flow
Doorkeeper.configure do
  # Use Mongoid 9 ORM for MongoDB persistence instead of ActiveRecord SQL
  orm :mongoid9

  # Authenticate resource owner using API Key in header
  resource_owner_authenticator do
    api_key = request.headers['X-Api-Key']
    ApiClient.find_by(api_key: api_key) || halt(401)
  end

  # Grant flows enabled: server-to-server authentication
  grant_flows %w[client_credentials]

  # Access token expiration (nil in development for ease of testing)
  access_token_expires_in nil

  # Skip authorization UI views (API-only mode)
  skip_authorization do
    true
  end
end

# Auto-create development test OAuth application matching frontend .env credentials
if Rails.env.development?
  Rails.application.config.after_initialize do
    Doorkeeper::Application.find_or_create_by!(
      uid: 'test_client_id'
    ) do |app|
      app.name = 'Development Test Client'
      app.secret = 'test_client_secret'
      app.redirect_uri = ''
    end rescue nil
  end
end
