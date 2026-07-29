module Api
  module V1
    class HealthController < ApplicationController
      def show
        redis_status = check_redis
        mongo_status = check_mongodb

        status_code = redis_status == 'connected' && mongo_status == 'connected' ? :ok : :service_unavailable

        render json: {
          status: status_code == :ok ? 'ok' : 'degraded',
          redis: redis_status,
          mongodb: mongo_status,
          sidekiq: check_sidekiq,
          timestamp: Time.current.iso8601
        }, status: status_code
      end

      private

      def check_redis
        Sidekiq.redis { |conn| conn.ping == 'PONG' ? 'connected' : 'error' }
      rescue => e
        "error: #{e.message}"
      end

      def check_mongodb
        Mongoid.default_client.database_names
        'connected'
      rescue => e
        "error: #{e.message}"
      end

      def check_sidekiq
        stats = Sidekiq::Stats.new
        {
          processed: stats.processed,
          failed: stats.failed,
          enqueued: stats.enqueued,
          workers: stats.workers_size
        }
      rescue
        'unavailable'
      end
    end
  end
end
