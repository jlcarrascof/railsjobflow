# app/services/result.rb
# Standard Result object pattern for encapsulating service operation outcomes
class Result
  attr_reader :value, :data, :error, :status

  def initialize(success:, value: nil, data: nil, error: nil, status: :ok)
    @success = success
    @value = value || data
    @data = @value
    @error = error
    @status = status
  end

  def success?
    @success
  end

  def failure?
    !@success
  end

  def self.success(value = nil, status: :ok)
    new(success: true, value: value, status: status)
  end

  def self.failure(error, status: :unprocessable_entity)
    new(success: false, error: error, status: status)
  end
end
