export const APPLICATION_CONFIG = Symbol('APPLICATION_CONFIG');

export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface ApplicationConfig {
  apiPort: number;
  apiPrefix: string;
  runtimeEnvironment: RuntimeEnvironment;
  serviceName: string;
}

const DEFAULT_API_PORT = 3000;
const DEFAULT_API_PREFIX = 'api';
const DEFAULT_RUNTIME_ENVIRONMENT: RuntimeEnvironment = 'development';
const DEFAULT_SERVICE_NAME = 'api';

export function loadApplicationConfig(
  environmentVariables: NodeJS.ProcessEnv
): ApplicationConfig {
  const apiPort = parsePortNumber(environmentVariables.API_PORT, DEFAULT_API_PORT);
  const apiPrefix = readOptionalString(environmentVariables.API_PREFIX, DEFAULT_API_PREFIX);
  const runtimeEnvironment = parseRuntimeEnvironment(
    environmentVariables.APP_RUNTIME,
    DEFAULT_RUNTIME_ENVIRONMENT
  );
  const serviceName = readOptionalString(environmentVariables.SERVICE_NAME, DEFAULT_SERVICE_NAME);

  return {
    apiPort,
    apiPrefix,
    runtimeEnvironment,
    serviceName
  };
}

function readOptionalString(
  rawEnvironmentValue: string | undefined,
  fallbackValue: string
): string {
  if (rawEnvironmentValue === undefined) {
    return fallbackValue;
  }

  const normalizedEnvironmentValue = rawEnvironmentValue.trim();

  if (normalizedEnvironmentValue.length === 0) {
    return fallbackValue;
  }

  return normalizedEnvironmentValue;
}

function parsePortNumber(rawPortValue: string | undefined, fallbackPort: number): number {
  if (rawPortValue === undefined) {
    return fallbackPort;
  }

  const normalizedPortValue = rawPortValue.trim();
  const parsedPortNumber = Number(normalizedPortValue);

  if (!Number.isInteger(parsedPortNumber) || parsedPortNumber <= 0 || parsedPortNumber > 65535) {
    throw new Error(
      `Invalid API_PORT value "${rawPortValue}". Use a valid TCP port between 1 and 65535.`
    );
  }

  return parsedPortNumber;
}

function parseRuntimeEnvironment(
  rawRuntimeEnvironment: string | undefined,
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
    `Invalid APP_RUNTIME value "${rawRuntimeEnvironment}". Use development, test, or production.`
  );
}
