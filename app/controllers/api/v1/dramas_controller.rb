# To list, create or update dramas from an API call.
class Api::V1::DramasController < ApplicationController
  DRAMA_LIST_CACHE_KEY = "drama_list"

  before_action :find_drama, only: :create
  before_action :load_drama, only: :update
  before_action -> { Rails.cache.delete(DRAMA_LIST_CACHE_KEY) }, only: %i[create update]
  before_action -> { Rails.cache.delete("drama/#{drama_params[:name]}") }, only: :update

  def index
    @dramas = Rails.cache.fetch(DRAMA_LIST_CACHE_KEY, expires_in: 1.week) do
      Drama.all.load
    end
  end

  def show
    @drama = Rails.cache.fetch("drama/#{params[:name]}", expires_in: 1.year) do
      Drama.find_by(name: params[:name])
    end
  end

  def create
    if @drama.update(drama_params)
      render(status: :ok, json: { "notice": @success_message })
    else
      render(status: :unprocessable_entity, json: { "error": @drama.errors.full_messages.to_sentence.capitalize })
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

  def find_drama
    @drama = Drama.find_or_initialize_by(name: drama_params[:name])
    @success_message = @drama.new_record? ? "Created!" : "Updated!"
  end

  def load_drama
    @drama = Drama.find_by!(name: drama_params[:name])
  end

  def drama_params = params.expect(drama: %i[airing_status country description last_watched_episode name total_episodes])
end
