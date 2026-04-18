import { RuntimeEnvironment } from './application-config';

export interface ValidatedEnvironmentVariables {
  API_PORT: number;
  API_PREFIX: string;
  APP_RUNTIME: RuntimeEnvironment;
  SERVICE_NAME: string;
  DATABASE_URL: string;
}

const DEFAULT_API_PORT = 3000;
const DEFAULT_API_PREFIX = 'api';
const DEFAULT_RUNTIME_ENVIRONMENT: RuntimeEnvironment = 'development';
const DEFAULT_SERVICE_NAME = 'api';
const DEFAULT_LOCAL_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/image_pipeline?schema=public';

export function validateEnvironmentVariables(
  rawEnvironmentVariables: Record<string, unknown>
): ValidatedEnvironmentVariables {
  const runtimeEnvironment = parseRuntimeEnvironment(
    rawEnvironmentVariables.APP_RUNTIME,
    DEFAULT_RUNTIME_ENVIRONMENT
  );

  return {
    API_PORT: parsePortNumber(rawEnvironmentVariables.API_PORT, DEFAULT_API_PORT),
    API_PREFIX: readOptionalString(rawEnvironmentVariables.API_PREFIX, DEFAULT_API_PREFIX),
    APP_RUNTIME: runtimeEnvironment,
    SERVICE_NAME: readOptionalString(rawEnvironmentVariables.SERVICE_NAME, DEFAULT_SERVICE_NAME),
    DATABASE_URL: parseDatabaseUrl(rawEnvironmentVariables.DATABASE_URL, runtimeEnvironment)
  };
}

function readOptionalString(rawEnvironmentValue: unknown, fallbackValue: string): string {
  if (typeof rawEnvironmentValue !== 'string') {
    return fallbackValue;
  }

  const normalizedEnvironmentValue = rawEnvironmentValue.trim();

  if (normalizedEnvironmentValue.length === 0) {
    return fallbackValue;
  }

  return normalizedEnvironmentValue;
}

function parsePortNumber(rawPortValue: unknown, fallbackPort: number): number {
  if (rawPortValue === undefined || rawPortValue === null || rawPortValue === '') {
    return fallbackPort;
  }

  const normalizedPortValue = String(rawPortValue).trim();
  const parsedPortNumber = Number(normalizedPortValue);

  if (!Number.isInteger(parsedPortNumber) || parsedPortNumber <= 0 || parsedPortNumber > 65535) {
    throw new Error(
      `Invalid API_PORT value "${String(rawPortValue)}". Use a valid TCP port between 1 and 65535.`
    );
  }

  return parsedPortNumber;
}

function parseRuntimeEnvironment(
  rawRuntimeEnvironment: unknown,
  fallbackRuntimeEnvironment: RuntimeEnvironment
): RuntimeEnvironment {
  const normalizedRuntimeEnvironment = readOptionalString(
    rawRuntimeEnvironment,
    fallbackRuntimeEnvironment
  );

  if (
    normalizedRuntimeEnvironment === 'development' ||
    normalizedRuntimeEnvironment === 'test' ||
    normalizedRuntimeEnvironment === 'production'
  ) {
    return normalizedRuntimeEnvironment;
  }

  throw new Error(
    `Invalid APP_RUNTIME value "${String(rawRuntimeEnvironment)}". Use development, test, or production.`
  );
}

function parseDatabaseUrl(
  rawDatabaseUrl: unknown,
  runtimeEnvironment: RuntimeEnvironment
): string {
  const databaseUrl = readOptionalString(rawDatabaseUrl, '');

  if (databaseUrl.length > 0) {
    return databaseUrl;
  }

  if (runtimeEnvironment === 'production') {
    throw new Error('DATABASE_URL is required when APP_RUNTIME is production.');
  }

  return DEFAULT_LOCAL_DATABASE_URL;
}
