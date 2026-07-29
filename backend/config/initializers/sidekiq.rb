# config/initializers/sidekiq.rb
require 'sidekiq-status'

Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }

  # Configure sidekiq-status middleware for real-time job status tracking on server
  Sidekiq::Status.configure_server_middleware config, expiry: 30.minutes
  Sidekiq::Status.configure_client_middleware config, expiry: 30.minutes
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }

  # Configure sidekiq-status middleware for real-time job status tracking on client
  Sidekiq::Status.configure_client_middleware config, expiry: 30.minutes
end
