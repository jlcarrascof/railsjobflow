# app/controllers/api/v1/jobs_controller.rb
module Api
  module V1
    class JobsController < ApplicationController
      def index
        page = [params.fetch(:page, 1).to_i, 1].max
        per_page = params.fetch(:per_page, 25).to_i.clamp(1, 100)

        jobs = WorkflowJob.recent
        total = jobs.count
        paginated = jobs.skip((page - 1) * per_page).limit(per_page)

        render json: {
          jobs: paginated.map { |j| serialize_job(j) },
          pagination: {
            page: page,
            per_page: per_page,
            total_count: total,
            total_pages: total.zero? ? 1 : (total.to_f / per_page).ceil
          },
          status_counts: status_counts
        }
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
          idempotency_key: request.headers['X-Idempotency-Key'],
          api_client_id: current_client&.id&.to_s
        )

        if result.success?
          render json: serialize_job(result.value), status: :accepted
        else
          render json: { error: result.error }, status: result.status
        end
      end

      private

      # Aggregate counts across ALL jobs (independent of the current page) so
      # the dashboard's observability cards reflect true system-wide totals.
      def status_counts
        {
          total: WorkflowJob.count,
          pending: WorkflowJob.pending.count,
          running: WorkflowJob.running.count,
          completed: WorkflowJob.completed.count,
          failed: WorkflowJob.failed.count
        }
      end

      def serialize_job(job)
        api_client = job.api_client_id.present? ? ApiClient.where(id: job.api_client_id).first : nil

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
          failed_at: job.failed_at&.iso8601,
          api_client_name: api_client&.name
        }
      end
    end
  end
end
