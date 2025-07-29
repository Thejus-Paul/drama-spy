# Used to serialize a drama object into a JSON response for show action.
class Drama::ShowResource < ApplicationResource
  attribute(:status) { :success }

  typelize_from Drama
  typelize metadata: :object
  attributes(:airing_status, :country, :description, :id, :last_watched_episode,
             :name, :total_episodes, :watch_status, :metadata)
end
