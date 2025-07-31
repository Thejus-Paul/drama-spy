require "test_helper"

# Tests for ApiResponders concern
class ApiRespondersTest < ActionDispatch::IntegrationTest
  class TestController < ActionController::API
    include ApiResponders

    def success_test
      render_success("Test success message")
    end

    def success_with_status_test
      render_success("Test success", status: :created)
    end

    def error_test
      render_error("Test error message")
    end

    def error_with_status_test
      render_error("Test error", status: :not_found)
    end

    def json_test
      drama = Drama.new(
        name: "Test Drama", airing_status: "ongoing", country: "Japan",
        total_episodes: 10, last_watched_episode: 5
      )
      render_json(Drama::ShowResource.new(drama))
    end
  end

  setup do
    Rails.application.routes.draw do
      get "success_test", to: "api_responders_test/test#success_test"
      get "success_with_status_test", to: "api_responders_test/test#success_with_status_test"
      get "error_test", to: "api_responders_test/test#error_test"
      get "error_with_status_test", to: "api_responders_test/test#error_with_status_test"
      get "json_test", to: "api_responders_test/test#json_test"
    end
  end

  teardown do
    Rails.application.reload_routes!
  end

  test "render_success should return proper JSON structure with default status" do
    get "/success_test"

    assert_response :ok
    assert_equal("success", json_body[:status])
    assert_equal("Test success message", json_body[:message])
  end

  test "render_success should handle custom status codes" do
    get "/success_with_status_test"

    assert_response :created
    assert_equal("success", json_body[:status])
    assert_equal("Test success", json_body[:message])
  end

  test "render_error should return proper JSON structure with default status" do
    get "/error_test"

    assert_response :unprocessable_content
    assert_equal("error", json_body[:status])
    assert_equal("Test error message", json_body[:message])
  end

  test "render_error should handle custom status codes" do
    get "/error_with_status_test"

    assert_response :not_found
    assert_equal("error", json_body[:status])
    assert_equal("Test error", json_body[:message])
  end

  test "render_json should serialize resources properly" do
    get "/json_test"

    assert_response :ok
    assert_equal("success", json_body[:status])
    assert_equal("Test Drama", json_body[:name])
    assert_equal("ongoing", json_body[:airing_status])
  end

  private

  def json_body
    JSON.parse(response.body, symbolize_names: true)
  end
end
