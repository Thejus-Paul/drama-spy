ActiveRecordDoctor.configure do
  # Global settings affect all detectors.
  global :ignore_tables, [
    # Ignore internal Rails-related tables.
    "solid_cache_entries",
    "schema_migrations"
  ]

  global :ignore_models, [
    # Ignore internal Rails-related models.
    "SolidCache::Entry"
  ]
end
