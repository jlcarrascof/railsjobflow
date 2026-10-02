Rails.application.routes.draw do
  # Mount Doorkeeper OAuth2 endpoints (/oauth/token, /oauth/authorize)
  use_doorkeeper

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  # Sidekiq Web UI - dashboard for monitoring background jobs in real time.
  # Restricted to development: in production (Sprint 8) it would be mounted
  # behind HTTP Basic Auth, not left open on the public routes.
  if Rails.env.development?
    require 'sidekiq/web'
    require 'sidekiq-status/web'
    mount Sidekiq::Web => '/sidekiq'
  end

  namespace :api do
    namespace :v1 do
      resources :jobs, only: [:index, :show, :create] do
        member do
          patch :cancel
          post :retry
        end
      end
      resources :api_clients, only: [:index, :create, :update]
      get 'health', to: 'health#show'
    end
  end
end
