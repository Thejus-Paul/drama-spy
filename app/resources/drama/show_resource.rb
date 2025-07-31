# Serializes individual drama for API show responses
class Drama::ShowResource < ApplicationResource
  attribute(:status) { :success }

  typelize_from Drama
  typelize metadata: { type: :object, nullable: true }
  attributes(:airing_status, :country, :description, :id, :last_watched_episode,
             :name, :total_episodes, :watch_status, :metadata, :poster_url)
end
