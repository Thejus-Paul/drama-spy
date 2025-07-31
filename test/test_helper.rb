ENV["RAILS_ENV"] ||= "test"

# Start SimpleCov BEFORE anything else
require "simplecov"
SimpleCov.start "rails" do
  add_filter "/test/"
  add_filter "/config/"
  add_filter "/vendor/"

  # Eagerly load all app files to ensure they're tracked
  enable_coverage :line
  track_files "app/**/*.rb"

  # Set coverage requirements
  minimum_coverage 80
  minimum_coverage_by_file 60
end

require_relative "../config/environment"
require "rails/test_help"
require "json"

module ActiveSupport
  class TestCase
    # Disable parallel testing to fix coverage tracking
    # parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
