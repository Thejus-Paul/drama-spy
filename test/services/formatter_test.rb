require "test_helper"

# Tests for Formatter service utility methods
class FormatterTest < ActiveSupport::TestCase
  test "should format single error message correctly" do
    drama = Drama.new
    drama.valid?

    formatted_error = Formatter.error(drama)

    # Should include multiple error messages formatted as a sentence
    # Based on the test output, only Country and Name are required for a minimal Drama
    assert_includes(formatted_error, "can't be blank")
    assert_match(/^[A-Z]/, formatted_error)
    assert_includes(formatted_error, " and ")
  end

  test "should format multiple error messages as sentence" do
    drama = Drama.new(name: "")
    drama.valid?

    formatted_error = Formatter.error(drama)

    assert_includes(formatted_error, " and ")
    assert_match(/^[A-Z]/, formatted_error)
  end

  test "should capitalize error messages" do
    drama = Drama.new(name: "")
    drama.valid?

    formatted_error = Formatter.error(drama)

    assert_match(/^[A-Z]/, formatted_error)
  end

  test "should handle model with no errors" do
    drama = Drama.new(
      name: "Valid Drama", airing_status: "ongoing", country: "Japan",
      total_episodes: 10, last_watched_episode: 0, watch_status: "not_started"
    )
    drama.valid?

    formatted_error = Formatter.error(drama)

    assert_equal("", formatted_error)
  end

  test "should handle model with single error" do
    drama = Drama.new(
      name: "", airing_status: "ongoing", country: "Japan",
      total_episodes: 10, last_watched_episode: 0, watch_status: "not_started"
    )
    drama.valid?

    formatted_error = Formatter.error(drama)

    assert_equal("Name can't be blank", formatted_error)
  end
end
