# Used to serialize a drama object into a JSON response for show action.
class Drama::ShowResource
  include Alba::Resource

  attribute(:status) { :success }

  attributes(:airing_status, :country, :description, :id, :last_watched_episode, :name, :total_episodes, :watch_status)
end
