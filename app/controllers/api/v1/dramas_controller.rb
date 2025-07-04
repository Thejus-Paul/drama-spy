# To list, create or update dramas from an API call.
class Api::V1::DramasController < ApplicationController
  LIST_CACHE_KEY = "drama_list"

  before_action :clear_cache, only: %i[create update]

  def index
    @dramas = Rails.cache.fetch(LIST_CACHE_KEY, expires_in: 1.week) { Drama.all.load }
  end

  def show
    drama = Rails.cache.fetch(cache_key(name), expires_in: 1.year) { Drama.find_by(name:) }

    render_error("Drama not found", status: :not_found) and return unless drama

    render(:show, locals: { drama: })
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

  def clear_cache = [ LIST_CACHE_KEY, cache_key(name) ].each { |key| Rails.cache.delete(key) }

  def cache_key(drama_name) = "drama/#{drama_name}"

  def name = params[:name] || drama_params[:name]

  def drama_params = params.expect(drama: %i[airing_status country description last_watched_episode name total_episodes])
end
