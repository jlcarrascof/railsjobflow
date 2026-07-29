# spec/factories/workflow_jobs.rb
FactoryBot.define do
  factory :workflow_job do
    title { Faker::Job.title }
    status { 'pending' }
    payload { { data: Faker::Lorem.word } }
    idempotency_key { SecureRandom.uuid }
    max_retries { 3 }

    trait :running do
      status { 'running' }
      started_at { 1.minute.ago }
    end

    trait :completed do
      status { 'completed' }
      started_at { 2.minutes.ago }
      completed_at { 1.minute.ago }
      duration_ms { 60_000 }
    end

    trait :failed do
      status { 'failed' }
      failed_at { Time.current }
      error_message { 'Something went wrong' }
    end
  end
end
