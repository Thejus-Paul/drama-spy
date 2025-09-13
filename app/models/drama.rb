# Drama model with validations for tracking watch progress and metadata
class Drama < ApplicationRecord
  LIMITS = {
    description: 2000,
    country: 50,
    name: 100,
    poster_url: 500,
    max_episodes: 200,
    min_episodes: 1,
    min_last_watched: 0
  }.freeze

  scope :in_progress_first, -> {
    where.not(watch_status: :not_started).order(:watch_status, updated_at: :desc)
  }

  enum :airing_status, { upcoming: 0, ongoing: 1, completed: 2 }, default: :upcoming, validate: true
  enum :watch_status, { not_started: 0, watching: 1, finished: 2 }, default: :not_started,
validate: true

  validates :airing_status, :country, :name, :watch_status, :total_episodes,
            :last_watched_episode, presence: true
  validates :description, length: { maximum: LIMITS[:description] }
  validates :country, length: { maximum: LIMITS[:country] }
  validates :name, length: { maximum: LIMITS[:name] }, uniqueness: true
  validates :poster_url, length: { maximum: LIMITS[:poster_url] },
            format: { with: /\Ahttps?:\/\/[^\n]+\z/i }, allow_blank: true
  validates :last_watched_episode,
            numericality: {
              greater_than_or_equal_to: LIMITS[:min_last_watched],
              less_than_or_equal_to: :total_episodes
            }
  validates :total_episodes,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: LIMITS[:min_episodes],
              less_than_or_equal_to: LIMITS[:max_episodes]
            }

  validate :last_watched_episode_valid, :metadata_valid

  before_save :update_watch_status

  private

  def last_watched_episode_valid
    return unless last_watched_episode.present? && total_episodes.present?

    if last_watched_episode < 0 || last_watched_episode > total_episodes
      errors.add(:last_watched_episode, "must be between 0 and the total number of episodes")
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

  def metadata_valid
    return unless metadata

    unless metadata.is_a?(Hash)
      errors.add(:metadata, "must be a valid JSON object")
      return
    end

    if metadata.to_json.bytesize > 10_000
      errors.add(:metadata, "is too large (maximum 10KB)")
    end
  end
end
