# To list, create or update dramas from an API call.
class Api::V1::DramasController < ApplicationController
  DRAMA_LIST_CACHE_KEY = "drama_list"

  before_action :load_drama, only: :update
  before_action -> { Rails.cache.delete(DRAMA_LIST_CACHE_KEY) }, only: %i[create update]

  def index
    @dramas = Rails.cache.fetch(DRAMA_LIST_CACHE_KEY, expires_in: 1.day) do
      Drama.all.load
    end
  end

  def create
    drama = Drama.new(drama_params)
    if drama.valid?
      render(status: :ok, json: { "notice": "Created!" })
    else
      render(status: :unprocessable_entity, json: { "error": drama.errors.full_messages.to_sentence.capitalize })
    end
  end

  def update
    if @drama.update(drama_params)
      render(status: :ok, json: { "notice": "Updated!" })
    else
      render(status: :unprocessable_entity, json: { "error": @drama.errors.full_messages.to_sentence.capitalize })
    end
  end

  private
  def load_drama
    @drama = Drama.find_by!(name: drama_params[:name])
  end

  def drama_params = params.expect(drama: %i[airing_status country description last_watched_episode name total_episodes])
end
