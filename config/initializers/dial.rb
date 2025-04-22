return unless Rails.env.development?

Dial.configure do |config|
  config.vernier_interval = 100
  config.vernier_allocation_interval = 10_000
  config.prosopite_ignore_queries += [ /pg_sleep/i ]
end
