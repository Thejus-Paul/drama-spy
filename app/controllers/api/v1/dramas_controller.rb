# To list, create or update dramas from an API call.
class Api::V1::DramasController < ApplicationController
  LIST_CACHE_KEY = "drama_list"

  before_action :clear_cache, only: %i[create update]

  def index
    @dramas = Rails.cache.fetch(LIST_CACHE_KEY, expires_in: 1.week) { Drama.all.load }
  end

  def show
    drama = Rails.cache.fetch(cache_key(name), expires_in: 1.year) { Drama.find_by(name:) }

    render(status: :not_found, json: { status: :error, message: "Drama not found" }) and return unless drama

    render(:show, locals: { drama: })
  end

  def create
    drama = Drama.new(drama_params)

    if drama.save
      render(status: :created, json: { status: :success, message: "Created!" })
    else
      render(status: :unprocessable_entity, json: { status: :error, message: Formatter.error(drama) })
    end
  end

  def update
    drama = Drama.find_by!(name: drama_params[:name])

    if drama.update(drama_params)
      render(status: :ok, json: { status: :success, message: "Updated!" })
    else
      render(status: :unprocessable_entity, json: { status: :error, message: Formatter.error(drama) })
    end
  end

  private

  def clear_cache = [ LIST_CACHE_KEY, cache_key(name) ].each { |key| Rails.cache.delete(key) }

  def cache_key(drama_name) = "drama/#{drama_name}"

  def name = params[:name] || drama_params[:name]

  def drama_params = params.expect(drama: %i[airing_status country description last_watched_episode name total_episodes])
end
