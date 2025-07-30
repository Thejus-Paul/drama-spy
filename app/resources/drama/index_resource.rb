# Serializes drama collection for API index responses
class Drama::IndexResource < ApplicationResource
  typelize_from Drama
  typelize metadata: :object
  attributes(:id, :last_watched_episode, :name, :watch_status, :metadata, :poster_url)
end
