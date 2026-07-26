# config/initializers/cors.rb
# Handle Cross-Origin Resource Sharing (CORS) to accept cross-origin requests from React frontend
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('FRONTEND_URL', 'http://localhost:5173'),
            /https:\/\/.*\.vercel\.app/

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization']
  end
end
