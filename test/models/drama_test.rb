require "test_helper"

# Test for the drama model
class DramaTest < ActiveSupport::TestCase
  setup do
    @drama = dramas(:one)
  end

  test "should be valid with valid attributes" do
    assert_predicate(@drama, :valid?)
  end

  test "should require presence of airing_status" do
    @drama.airing_status = nil

    refute_predicate(@drama, :valid?)
    assert_includes(@drama.errors.full_messages, "Airing status can't be blank")
  end

  test "should require presence of country" do
    assert_presence_validation(:country, "Country can't be blank")
  end

  test "should enforce country length limit" do
    assign_overlength(:country, ::Drama::LIMITS[:country])

    refute_predicate(@drama, :valid?)
    assert_equal("Country is too long (maximum is #{::Drama::LIMITS[:country]} characters)", @drama.errors.full_messages.to_sentence)
  end

  test "should require presence of name" do
    assert_presence_validation(:name, "Name can't be blank")
  end

  test "should enforce name length limit" do
    assign_overlength(:name, ::Drama::LIMITS[:name])

    refute_predicate(@drama, :valid?)
    assert_equal("Name is too long (maximum is #{::Drama::LIMITS[:name]} characters)", @drama.errors.full_messages.to_sentence)
  end

  test "should enforce description length limit" do
    assign_overlength(:description, ::Drama::LIMITS[:description])

    refute_predicate(@drama, :valid?)
    assert_equal("Description is too long (maximum is #{::Drama::LIMITS[:description]} characters)", @drama.errors.full_messages.to_sentence)
  end

  test "should require presence of watch_status" do
    @drama.watch_status = nil

    refute_predicate(@drama, :valid?)
    assert_includes(@drama.errors.full_messages, "Watch status can't be blank")
  end

  test "should enforce uniqueness of name" do
    duplicate_drama = @drama.dup

    refute_predicate(duplicate_drama, :valid?)
    assert_equal("Name has already been taken", duplicate_drama.errors.full_messages.to_sentence)
  end

  test "should be invalid when last_watched_episode is negative" do
    @drama.last_watched_episode = -1

    refute_predicate(@drama, :valid?)
  end

  test "should be invalid when last_watched_episode exceeds total episodes" do
    @drama.last_watched_episode = @drama.total_episodes + 1

    refute_predicate(@drama, :valid?)
  end

  test "should be valid when last_watched_episode is within range" do
    @drama.last_watched_episode = @drama.total_episodes

    assert_predicate(@drama, :valid?)
  end

  test "should be invalid when total_episodes is zero" do
    @drama.total_episodes = 0

    refute_predicate(@drama, :valid?)
  end

  test "should be valid when total_episodes is positive" do
    @drama.total_episodes = 1

    assert_predicate(@drama, :valid?)
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

  test "should convert nil metadata to empty hash before validation" do
    @drama.metadata = nil
    @drama.valid? # trigger validations

    assert_equal({}, @drama.metadata)
    assert_predicate(@drama, :valid?)
  end

  test "should accept valid metadata as hash" do
    @drama.metadata = { "id" => "123", "source" => "query_param" }

    assert_predicate(@drama, :valid?)
  end

  test "should reject metadata that is not a hash" do
    @drama.metadata = "invalid_string"

    refute_predicate(@drama, :valid?)
    assert_includes(@drama.errors.full_messages, "Metadata must be a valid JSON object")
  end

  test "should reject metadata that is too large" do
    large_metadata = { "data" => "x" * 15_000 } # Over 10KB limit
    @drama.metadata = large_metadata

    refute_predicate(@drama, :valid?)
    assert_includes(@drama.errors.full_messages, "Metadata is too large (maximum 10KB)")
  end

  test "should allow empty metadata hash" do
    @drama.metadata = {}

    assert_predicate(@drama, :valid?)
  end

  test "should persist metadata correctly" do
    metadata = { "id" => "drama123", "source" => "query_param", "timestamp" => Time.current.to_s }
    @drama.metadata = metadata
    @drama.save!

    @drama.reload
    assert_equal(metadata["id"], @drama.metadata["id"])
    assert_equal(metadata["source"], @drama.metadata["source"])
    assert_equal(metadata["timestamp"], @drama.metadata["timestamp"])
  end

  test "should handle nested metadata structure" do
    nested_metadata = {
      "id" => "123",
      "source" => "query_param",
      "additional_data" => {
        "user_agent" => "Chrome",
        "referrer" => "google.com"
      }
    }
    @drama.metadata = nested_metadata
    @drama.save!

    @drama.reload
    assert_equal("Chrome", @drama.metadata["additional_data"]["user_agent"])
    assert_equal("google.com", @drama.metadata["additional_data"]["referrer"])
  end

  private

  def assign_overlength(attribute, max_length)
    @drama.send("#{attribute}=", "A" * (max_length + 1))
  end

  def assert_presence_validation(attribute, expected_message)
    @drama.send("#{attribute}=", nil)

    refute_predicate(@drama, :valid?)
    assert_equal(expected_message, @drama.errors.full_messages.to_sentence)
  end
end
