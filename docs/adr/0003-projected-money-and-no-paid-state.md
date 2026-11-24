# Projected money records, and no "paid" state

Obligations generate **projected** money records that count in totals but are never treated as paid and never need confirming; **recorded** money records are those the user entered or confirmed. Omniva has no "paid" state in the MVP because it does not track payments.

## Considered Options

- Expected costs that the user confirms each cycle: rejected, because confirming a monthly subscription twelve times a year breaks the low-effort principle.
- Auto-confirming expected costs as paid: rejected, because it breaks the approved "ask, never assume" rule.
