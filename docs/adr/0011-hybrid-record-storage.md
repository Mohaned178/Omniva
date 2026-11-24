# Hybrid record storage: fixed anatomy, validated flexible fields

The shared anatomy and each building block's structure are stored in fixed columns; Type-specific and custom fields are stored in a flexible structured field validated against the Type definition. Built-in Types are defined in code within their life-module pack; custom types are stored per workspace as data, using the same definition shape.

## Considered Options

- A table per Type: strict, but every new or custom Type needs a database change.
- Generic key/value rows: flexible, but slow, hard to query and hard to validate.
