import { RuntimeEnvironment } from '../../infrastructure/config/application-config';

export interface HealthStatusResponse {
  status: 'ok';
  serviceName: string;
  runtimeEnvironment: RuntimeEnvironment;
  uptimeInSeconds: number;
  timestamp: string;
}
