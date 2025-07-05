# Used to serialize a list of dramas into a JSON response for index action.
class Drama::IndexResource < ApplicationResource
  typelize_from Drama
  attributes(:id, :last_watched_episode, :name, :watch_status)
end
