export const APPLICATION_CONFIG = Symbol('APPLICATION_CONFIG');

export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface ApplicationConfig {
  apiPort: number;
  apiPrefix: string;
  runtimeEnvironment: RuntimeEnvironment;
  serviceName: string;
}
