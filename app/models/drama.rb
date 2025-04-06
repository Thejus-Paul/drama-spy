# Drama model with required validations
class Drama < ApplicationRecord
  enum :airing_status, [ :upcoming, :ongoing, :completed ], default: :upcoming, validate: true
  enum :watch_status, [ :not_started, :watching, :finished ], default: :not_started, validate: true

  validates :airing_status, :country, :name, :watch_status, presence: true
  validates :name, uniqueness: true
  validates :last_watched_episode, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: :total_episodes }
  validates :total_episodes, presence: true, numericality: { greater_than_or_equal_to: 1 }
  validate :last_watched_episode_valid

  before_save :update_watch_status

  private

  def last_watched_episode_valid
    if last_watched_episode.present? && total_episodes.present? && last_watched_episode > total_episodes
      errors.add(:last_watched_episode, "cannot exceed total episodes")
    end
  end

  def update_watch_status
    if last_watched_episode == total_episodes
      self.watch_status = :finished
    elsif last_watched_episode > 0 && last_watched_episode < total_episodes
      self.watch_status = :watching
    else
      self.watch_status = :not_started
    end
  end
end
