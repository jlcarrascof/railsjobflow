# app/controllers/api/v1/jobs_controller.rb
module Api
  module V1
    class JobsController < ApplicationController
      def index
        jobs = WorkflowJob.recent.limit(50)
        render json: jobs.map { |j| serialize_job(j) }
      end

      def show
        job = WorkflowJob.find(params[:id])
        render json: serialize_job(job)
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Job not found' }, status: :not_found
      end

      def cancel
        job = WorkflowJob.find(params[:id])
        if job.cancel!
          render json: serialize_job(job), status: :ok
        else
          render json: { error: 'Only pending jobs can be cancelled' }, status: :unprocessable_content
        end
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Job not found' }, status: :not_found
      end

      def retry
        job = WorkflowJob.find(params[:id])
        if job.retry!
          WorkflowWorker.perform_async(job.id.to_s)
          render json: serialize_job(job), status: :ok
        else
          render json: { error: 'Only failed jobs can be retried' }, status: :unprocessable_content
        end
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Job not found' }, status: :not_found
      end

      def create
        result = WorkflowService.call(
          title: params.require(:title),
          payload: params[:payload]&.to_unsafe_h || {},
          idempotency_key: request.headers['X-Idempotency-Key']
        )

        if result.success?
          render json: serialize_job(result.value), status: :accepted
        else
          render json: { error: result.error }, status: result.status
        end
      end

      private

      def serialize_job(job)
        {
          id: job.id.to_s,
          title: job.title,
          status: job.status,
          payload: job.payload,
          retries: job.retries,
          max_retries: job.max_retries,
          idempotency_key: job.idempotency_key,
          duration_ms: job.duration_ms,
          error_message: job.error_message,
          created_at: job.created_at&.iso8601,
          started_at: job.started_at&.iso8601,
          completed_at: job.completed_at&.iso8601,
          failed_at: job.failed_at&.iso8601
        }
      end
    end
  end
end
