# Drama model with required validations
class Drama < ApplicationRecord
  MAX_DESCRIPTION_LENGTH = 1000
  MAX_COUNTRY_LENGTH = 50
  MAX_NAME_LENGTH = 100
  MAX_EPISODE_COUNT = 200
  MIN_EPISODE_COUNT = 1
  MIN_LAST_WATCHED_EPISODE = 0

  enum :airing_status, [ :upcoming, :ongoing, :completed ], default: :upcoming, validate: true
  enum :watch_status, [ :not_started, :watching, :finished ], default: :not_started, validate: true

  validates :airing_status, :country, :name, :watch_status, :total_episodes, :last_watched_episode, presence: true
  validates :description, length: { maximum: MAX_DESCRIPTION_LENGTH }
  validates :country, length: { maximum: MAX_COUNTRY_LENGTH }
  validates :name, length: { maximum: MAX_NAME_LENGTH }, uniqueness: true
  validates :last_watched_episode, numericality: { greater_than_or_equal_to: MIN_LAST_WATCHED_EPISODE, less_than_or_equal_to: :total_episodes }
  validates :total_episodes, numericality: { only_integer: true, greater_than_or_equal_to: MIN_EPISODE_COUNT, less_than_or_equal_to: MAX_EPISODE_COUNT }

  validate :last_watched_episode_valid, :total_episodes_valid

  before_save :update_watch_status

  private

  def last_watched_episode_valid
    return unless last_watched_episode.present? && total_episodes.present?

    if last_watched_episode < 0 || last_watched_episode > total_episodes
      errors.add(:last_watched_episode, "must be between 0 and the total number of episodes")
    end
  end

  def total_episodes_valid
    return unless total_episodes.present?

    if total_episodes < 1 || total_episodes > 200
      errors.add(:last_watched_episode, "must be a valid number between 1 and 200")
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
