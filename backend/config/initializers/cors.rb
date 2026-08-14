# config/initializers/cors.rb
# Handle Cross-Origin Resource Sharing (CORS) to accept requests from React frontend origins
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173',
            'http://127.0.0.1:5173',
            ENV.fetch('FRONTEND_URL', 'http://localhost:5173'),
            /https:\/\/.*\.vercel\.app/

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization', 'X-Idempotency-Key']
  end
end
