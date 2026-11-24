# Background jobs are queued in PostgreSQL itself

Background jobs and change notifications are stored in PostgreSQL, not in a separate queue system, so a change and its notification are saved in the same transaction (ADR 0008) with one fewer moving part. A dedicated queue product can be introduced later if scale demands it.
