import {
    LoggerExtensionPoint,
    LogMessage,
    // @ts-expect-error - resolution not working
} from '@composaic/plugins/impl/logger';
// @ts-expect-error - resolution not working
import { Plugin } from '@composaic/plugins/types';

export class SimpleLoggerExtension implements LoggerExtensionPoint {
    private log?: (message: LogMessage) => void;
    getSubSystemName(): string {
        return 'Test Plugin';
    }
    setLogCallback(log: (message: LogMessage) => void): void {
        this.log = log;
        this.log({
            level: 'info',
            message: 'Logger initialised',
            timestamp: new Date(),
        });
    }
}

export class SimpleLoggerPlugin extends Plugin {}
