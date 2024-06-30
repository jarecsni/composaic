import { Plugin } from '../../types';

export type LogMessage = {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error';
    message: string;
    timestamp: Date;
    args?: unknown[];
};

/**
 * Logger extension point.
 *
 * Extensions for this extension point will need to implement these methods.
 */
export interface LoggerExtensionPoint {
    getSubSystemName(): string;
    setLogCallback(log: (message: LogMessage) => void): void;
}

export class LoggerPlugin extends Plugin {
    start(): void {
        this.getConnectedExtensions('logger').forEach((extension) => {
            const loggerExtension = extension.extensionImpl as LoggerExtensionPoint;
            loggerExtension.setLogCallback((message: LogMessage) => {
                console.log(
                    `${message.timestamp.toISOString()} [${message.level.toUpperCase()}] [${loggerExtension.getSubSystemName()
                    }] ${message.message}`
                );
            });
        });
    }
    stop(): void { }
}

export class SimpleLoggerExtension implements LoggerExtensionPoint {
    private log?: (message: LogMessage) => void;
    getSubSystemName(): string {
        return 'Composaic Framework';
    }
    setLogCallback(log: (message: LogMessage) => void): void {
        this.log = log;
        this.log({ level: 'info', message: 'Logger initialised', timestamp: new Date() });
    }
}
