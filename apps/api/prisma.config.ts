import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const localDevelopmentDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/image_pipeline?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: localDevelopmentDatabaseUrl
  }
});
