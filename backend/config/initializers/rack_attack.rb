# config/initializers/rack_attack.rb
# Rack::Attack rate limiting configuration backed by Redis store
class Rack::Attack
  # Store rate limit counters in Redis
  Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(
    url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')
  )

  # Throttle: 100 requests per minute per OAuth Bearer token
  throttle('api/token', limit: 100, period: 1.minute) do |request|
    if request.path.start_with?('/api/')
      auth_header = request.get_header('HTTP_AUTHORIZATION')
      auth_header&.gsub('Bearer ', '')&.presence
    end
  end

  # Throttle: 10 requests per minute on OAuth token endpoint (prevent brute force)
  throttle('oauth/token', limit: 10, period: 1.minute) do |request|
    request.ip if request.path == '/oauth/token'
  end

  # Custom responder formatting HTTP 429 Too Many Requests response with Retry-After header
  self.throttled_responder = lambda do |request|
    retry_after = (request.env['rack.attack.match_data'] || {})[:period]
    [
      429,
      {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s
      },
      [{ error: 'too_many_requests', message: 'Rate limit exceeded', retry_after: retry_after }.to_json]
    ]
  end
end
