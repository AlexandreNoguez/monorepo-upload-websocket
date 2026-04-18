import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { ValidatedEnvironmentVariables } from '../config/environment-variables';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public constructor(configService: ConfigService<ValidatedEnvironmentVariables>) {
    super({
      adapter: createPostgresqlAdapter(configService)
    });
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

function createPostgresqlAdapter(
  configService: ConfigService<ValidatedEnvironmentVariables>
): PrismaPg {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize the Prisma PostgreSQL adapter.');
  }

  return new PrismaPg({
    connectionString: databaseUrl,
  });
}
