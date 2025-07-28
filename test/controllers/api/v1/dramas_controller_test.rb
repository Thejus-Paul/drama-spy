require "test_helper"

# Tests the API endpoints for managing dramas.
class Api::V1::DramasControllerTest < ActionDispatch::IntegrationTest
  setup do
    @drama = Drama.create!(
      name: "Test Drama",
      airing_status: "ongoing",
      country: "Japan",
      description: "A mystery drama.",
      last_watched_episode: 5,
      total_episodes: 20,
      metadata: {}
    )
  end

  test "should get drama list" do
    get api_v1_dramas_path

    assert_response :ok
    assert_equal(1, json_body.count)
  end

  test "should get drama from DB" do
    get(api_v1_drama_path(@drama.name))

    assert_response :ok
    assert_equal("success", json_body[:status])
    assert_equal(@drama.name, json_body[:name])
  end

    test "should return 404 with error if drama not found" do
    get(api_v1_drama_path("Nonexistent drama"))

    assert_response :not_found
    assert_equal("error", json_body[:status])
    assert_equal("Drama not found", json_body[:message])
  end

  test "should create drama" do
    drama = {
      name: "New Drama", airing_status: "completed",
      country: "Korea", description: "A comedy series.",
      last_watched_episode: 10, total_episodes: 15,
      metadata: {}
    }

    post(api_v1_dramas_path, params: { drama: })

    assert_response :created
    assert_equal("Created!", json_body[:message])

    get(api_v1_drama_path(drama[:name]))

    assert_response :ok
    assert_equal(drama[:name], json_body[:name])
  end

  test "should update drama" do
    patch(api_v1_drama_path(@drama), params: { drama: {
      name: @drama.name, description: "An updated description."
    } })

    assert_response :ok
    assert_equal("success", json_body[:status])
    assert_equal("Updated!", json_body[:message])
    assert_equal("An updated description.", @drama.reload.description)
  end

  test "should return error on invalid drama creation" do
    post(api_v1_dramas_path, params: { drama: { name: "" } })

    assert_response :unprocessable_entity
    assert_equal("error", json_body[:status])
    assert_equal("Country can't be blank and name can't be blank", json_body[:message])
  end

  private

  def json_body = JSON.parse(response.body, symbolize_names: true)
end
