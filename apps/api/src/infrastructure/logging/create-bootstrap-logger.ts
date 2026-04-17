import { Logger, LogLevel } from '@nestjs/common';

import { RuntimeEnvironment } from '../config/application-config';

export interface BootstrapLogger {
  log(message: string): void;
  getEnabledLogLevels(): LogLevel[];
}

export function createBootstrapLogger(runtimeEnvironment: RuntimeEnvironment): BootstrapLogger {
  const nestLogger = new Logger('Bootstrap');

  return {
    log(message: string): void {
      nestLogger.log(message);
    },
    getEnabledLogLevels(): LogLevel[] {
      if (runtimeEnvironment === 'production') {
        return ['log', 'warn', 'error'];
      }

      return ['log', 'warn', 'error', 'debug', 'verbose'];
    }
  };
}
