# Drama model with required validations
class Drama < ApplicationRecord
  LIMITS = {
    description: 2000,
    country: 50,
    name: 100,
    max_episodes: 200,
    min_episodes: 1,
    min_last_watched: 0
  }.freeze

  enum :airing_status, %i[ upcoming ongoing completed ], default: :upcoming, validate: true
  enum :watch_status, %i[ not_started watching finished ], default: :not_started, validate: true

  validates :airing_status, :country, :name, :watch_status, :total_episodes, :last_watched_episode, presence: true
  validates :description, length: { maximum: LIMITS[:description] }
  validates :country, length: { maximum: LIMITS[:country] }
  validates :name, length: { maximum: LIMITS[:name] }, uniqueness: true
  validates :last_watched_episode, numericality: { greater_than_or_equal_to: LIMITS[:min_last_watched], less_than_or_equal_to: :total_episodes }
  validates :total_episodes, numericality: { only_integer: true, greater_than_or_equal_to: LIMITS[:min_episodes], less_than_or_equal_to: LIMITS[:max_episodes] }

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
