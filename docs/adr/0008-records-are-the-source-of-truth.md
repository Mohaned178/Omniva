# Records are the source of truth; everything else is derived and rebuildable

Reminder schedules, the search index, Insights and inferred connections are derived from records and can be rebuilt from them at any time. Changes to records are announced through durable change notifications, saved together with the change and processed by the worker, so derived data catches up even after a crash. The Activity Timeline is the exception: it is written in the same transaction as the change it describes. We chose this because the hard gate of zero missed reminders requires that a bug or crash in derived data can always be repaired from the records.

## Considered Options

- Direct updates to derived data within the same request: simpler, but a crash can silently lose a reminder-schedule update.
