# The Next.js server never touches user data

Public pages are pre-rendered; app pages run in the browser and get all data from the NestJS API. The Next.js server has no database access and renders no personal data. We chose this over server-rendering app pages so that exactly one component, the API, enforces workspace isolation (ADR 0009), accepting slightly slower first loads of app pages.
