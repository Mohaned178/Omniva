# Reminder delivery: a rebuildable schedule, idempotent sends, daily reconciliation

Reminders are calculated from key dates into a derived schedule of due notices that the worker checks every minute. Each send is recorded under a unique key so retries never send twice and never skip, and a daily reconciliation rebuilds the schedule from key dates, compares it with the live one and raises an alert on any difference. We chose this layered approach because "zero missed or wrong reminders" is a hard gate of the MVP, and a single mechanism can fail silently.
