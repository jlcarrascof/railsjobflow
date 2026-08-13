# app/models/api_client.rb
# Mongoid model representing authorized API clients with webhooks credentials and API keys
class ApiClient
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name,           type: String
  field :api_key,        type: String
  field :webhook_url,    type: String
  field :webhook_secret, type: String

  index({ api_key: 1 }, { unique: true })

  validates :name, :api_key, presence: true

  before_validation :generate_api_key, on: :create

  def self.find_by(attrs)
    where(attrs).first
  end

  private

  def generate_api_key
    self.api_key ||= SecureRandom.hex(32)
  end
end
