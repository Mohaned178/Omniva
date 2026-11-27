# Omniva's own tasks across workspaces read through narrow, named policies

Some of Omniva's own work has to look across every workspace, such as the worker's minute check for due reminders (ADR 0012), yet row-level security refuses every row unless a transaction names one workspace (ADR 0009). Such work runs in a transaction that names its task instead of a workspace; a table it needs carries one extra read-only policy for that task alone, so the task sees only that table and writes nothing, and it then does the real work in ordinary transactions scoped to each workspace it found. We chose this over walking every user each minute, which needs no new policy but costs a query per user, and over a separate database role, which walls the task off more strongly but adds role grants to every environment.

## Consequences

- A forgetful query still sees nothing: only a transaction that names a task gets the extra reach, and only on the tables whose policies name that task.
- Each task and the tables it may read are listed in the database-level isolation test, which proves the task sees no other table and cannot write.
