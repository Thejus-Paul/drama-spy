require "test_helper"

# Test for the drama model
class DramaTest < ActiveSupport::TestCase
  setup do
    @drama = dramas(:one)
  end

  test "should be valid with valid attributes" do
    assert @drama.valid?
  end

  test "should require presence of airing_status" do
    @drama.airing_status = nil
    refute @drama.valid?
    assert_includes(@drama.errors.full_messages, "Airing status can't be blank")
  end

  test "should require presence of country" do
    assert_presence_validation(:country, "Country can't be blank")
  end

  test "should require presence of name" do
    assert_presence_validation(:name, "Name can't be blank")
  end

  test "should require presence of watch_status" do
    @drama.watch_status = nil
    refute @drama.valid?
    assert_includes(@drama.errors.full_messages, "Watch status can't be blank")
  end

  test "should enforce uniqueness of name" do
    duplicate_drama = @drama.dup
    refute duplicate_drama.valid?
    assert_equal("Name has already been taken", duplicate_drama.errors.full_messages.to_sentence)
  end

  test "should be invalid when last_watched_episode is negative" do
    @drama.last_watched_episode = -1
    refute @drama.valid?
  end

  test "should be invalid when last_watched_episode exceeds total episodes" do
    @drama.last_watched_episode = @drama.total_episodes + 1
    refute @drama.valid?
  end

  test "should be valid when last_watched_episode is within range" do
    @drama.last_watched_episode = @drama.total_episodes
    assert @drama.valid?
  end

  test "should be invalid when total_episodes is zero" do
    @drama.total_episodes = 0
    refute @drama.valid?
  end

  test "should be valid when total_episodes is positive" do
    @drama.total_episodes = 1
    assert @drama.valid?
  end

  test "should set watch_status to not_started when last_watched_episode is 0" do
    @drama.last_watched_episode = 0
    @drama.save!
    assert_equal("not_started", @drama.watch_status)
  end

  test "should set watch_status to watching when last_watched_episode is in progress" do
    @drama.last_watched_episode = @drama.total_episodes - 1
    @drama.save!
    assert_equal("watching", @drama.watch_status)
  end

  test "should set watch_status to finished when last_watched_episode equals total_episodes" do
    @drama.last_watched_episode = @drama.total_episodes
    @drama.save!
    assert_equal("finished", @drama.watch_status)
  end

  private

  def assert_presence_validation(attribute, expected_message)
    @drama.send("#{attribute}=", nil)
    refute @drama.valid?
    assert_equal(expected_message, @drama.errors.full_messages.to_sentence)
  end
end
