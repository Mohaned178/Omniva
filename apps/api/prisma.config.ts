import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // Falls back to the local Docker database; every deployed environment sets DATABASE_URL.
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://omniva:omniva@localhost:55432/omniva',
  },
});
