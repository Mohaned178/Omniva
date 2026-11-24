# Life modules are type packs on a shared records core

Each of the twelve life modules is a package of Type definitions and a few module-specific rules built on the shared Records core, not a subsystem with its own storage. We chose this so that modules stay connected by construction and a new module is a pack, not a new app, accepting that unusual module behaviour must fit the core or extend it deliberately.
