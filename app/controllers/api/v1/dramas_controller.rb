# Handles API endpoints for drama management (list, show, create, update)
class Api::V1::DramasController < ApplicationController
  def index
    dramas = Rails.cache.fetch(Drama::LIST_CACHE_KEY, expires_in: 1.week) { Drama.in_progress_first.load }

    render_json(Drama::IndexResource.new(dramas))
  end

  def show
    cache_key = CacheKeyService.get_key(name, Drama::CACHE_TYPE)
    drama = Rails.cache.fetch(cache_key, expires_in: 1.year) { Drama.find_by(name:) }

    render_error("Drama not found", status: :not_found) and return unless drama

    render_json(Drama::ShowResource.new(drama))
  end

  def create
    drama = Drama.new(drama_params)

    render_error(Formatter.error(drama)) and return unless drama.save

    render_success("Created!", status: :created)
  end

  def update
    drama = Drama.find_by!(name: drama_params[:name])

    render_error(Formatter.error(drama)) and return unless drama.update(drama_params)

    render_success("Updated!")
  end

  private

  def name = params[:name] || drama_params[:name]

  def drama_params
    params.expect(drama: [ :airing_status, :country, :description,
:last_watched_episode, :name, :poster_url, :total_episodes, { metadata: {} } ])
  end
end
