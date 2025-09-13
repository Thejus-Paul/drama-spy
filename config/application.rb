require_relative "boot"

require "rails"

require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module DramaSpy
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Remove middleware that are not needed for API only apps
    # Serves static files like images, CSS, and JS. Useless for pure APIs.
    config.middleware.delete ActionDispatch::Static
    # Enables X-Sendfile/Sendfile header support for front-ends; not needed for pure APIs.
    config.middleware.delete Rack::Sendfile
    # Converts HEAD requests to GET internally. Often irrelevant if you’re not handling HEAD.
    config.middleware.delete Rack::Head
    # Handles HTTP caching headers. Fine to remove unless you're manually supporting these.
    config.middleware.delete Rack::ConditionalGet
    # Handles HTTP caching headers. Fine to remove unless you're manually supporting these.
    config.middleware.delete Rack::ETag
    # Handles remote IP addresses. Fine to remove unless you're handling proxies.
    config.middleware.delete ActionDispatch::RemoteIp
    # Checks for pending migrations.
    config.middleware.delete ActiveRecord::Migration::CheckPending if Rails.env.production?
    # Checks the host header.
    config.middleware.delete ActionDispatch::HostAuthorization unless Rails.env.production?

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    config.active_record.action_on_strict_loading_violation = :raise
  end
end
