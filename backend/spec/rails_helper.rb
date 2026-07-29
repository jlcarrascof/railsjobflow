# spec/rails_helper.rb
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

# Prevent execution if in production environment
abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'
require 'mongoid-rspec'

RSpec.configure do |config|
  # Explicitly disable ActiveRecord support since we use MongoDB
  config.use_active_record = false

  # Clean MongoDB database before each test suite execution
  config.before(:each) do
    Mongoid.purge!
  end

  # Include Mongoid matchers and FactoryBot syntax helpers
  config.include Mongoid::Matchers
  config.include FactoryBot::Syntax::Methods

  config.filter_rails_from_backtrace!
end
