# Isolation tests gate every build

Every API endpoint is automatically called by a user from another workspace and must refuse, a database-level test confirms PostgreSQL refuses even when the application gate is bypassed, and a new endpoint without an isolation test fails the build. We chose a build-blocking suite over periodic audits because "zero cross-account data exposure" is a hard gate and most code is written by AI agents, so the guarantee has to be enforced mechanically on every change rather than by review alone.
