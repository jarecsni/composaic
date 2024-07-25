import {
    LoggerExtensionPoint,
    LogMessage,
    // @ts-expect-error - resolution not working
} from '@composaic/plugins/impl/logger';
// @ts-expect-error - resolution not working
import { Plugin } from '@composaic/plugins/types';

export class SimpleLoggerExtension implements LoggerExtensionPoint {
    log?: (message: LogMessage) => void;
    getSubSystemName(): string {
        return 'Test Plugin';
    }
    setLogCallback(log: (message: LogMessage) => void): void {
        this.log = log;
        this.log({
            level: 'info',
            message: 'Logger initialised',
            timestamp: new Date(),
            subSystemName: this.getSubSystemName()
        });
    }
}

export class SimpleLoggerPlugin extends Plugin {
    extension?: SimpleLoggerExtension;
    start(): void {
        // @ts-expect-error - resolution not working
        this.extension = this.getExtensionImpl('@composaic/logger', 'logger');
    }
    log(message: string) {
        if (this.extension !== undefined) {
            this.extension.log!({
                level: 'info',
                message,
                timestamp: new Date(),
                subSystemName: this.extension.getSubSystemName()
            });
        }
    }
}
