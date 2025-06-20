ActiveRecordDoctor.configure do
  # Global settings affect all detectors.
  global :ignore_tables, [
    # Ignore internal Rails-related tables.
    "solid_cache_entries",
    "schema_migrations"
  ]

  global :ignore_models, [
    # Ignore SolidCache-related models.
    "SolidCache::Entry",
    # SolidQueue-related models
    "SolidQueue::BlockedExecution",
    "SolidQueue::ClaimedExecution",
    "SolidQueue::FailedExecution",
    "SolidQueue::Job",
    "SolidQueue::Pause",
    "SolidQueue::Process",
    "SolidQueue::ReadyExecution",
    "SolidQueue::RecurringExecution",
    "SolidQueue::RecurringTask",
    "SolidQueue::ScheduledExecution",
    "SolidQueue::Semaphore"
  ]
end
