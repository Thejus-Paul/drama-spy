class Drama < ApplicationRecord
  belongs_to :user

  validates_presence_of :name, :last_watched_episode
  validates_uniqueness_of :name
end
