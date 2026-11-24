# A modular monolith with a separate worker process

Omniva is one application deployed as a unit, with strictly separated internal modules, plus a worker process running the same codebase for background work. We chose this over microservices and serverless functions because a small team and an early product gain nothing from distributed deployment, while reminders need strong consistency that network boundaries make harder to guarantee.

## Considered Options

- Microservices: network failures, distributed data and operations overhead with no benefit at this scale.
- Serverless functions: logic split into fragments, and scheduling guarantees harder to reason about.
