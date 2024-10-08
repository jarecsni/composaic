import { Plugin } from '../../types.js';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogMessage = {
    level: LogLevel;
    message: string;
    timestamp: Date;
    subSystemName: string;
    args?: unknown[];
};

export const ComposaicSubSystemName = 'Composaic';

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
    async start() {
        super.start();
        this.log({
            level: 'info',
            message: '@composaic/logger plugin started',
            timestamp: new Date(),
            subSystemName: ComposaicSubSystemName,
        });
        this.getConnectedExtensions('logger').forEach((extension) => {
            const loggerExtension =
                extension.extensionImpl as LoggerExtensionPoint;
            loggerExtension.setLogCallback(this.log.bind(this));
        });
    }
    async stop() {}
    log(message: LogMessage) {
        console.log(
            `${message.timestamp.toISOString()} [${message.level.toUpperCase()}] [${message.subSystemName}] ${message.message}`
        );
    }
}

export class SimpleLoggerExtension implements LoggerExtensionPoint {
    private log?: (message: LogMessage) => void;
    getSubSystemName(): string {
        return ComposaicSubSystemName;
    }
    setLogCallback(log: (message: LogMessage) => void): void {
        this.log = log;
        this.log({
            level: 'info',
            message: 'Logger initialised',
            timestamp: new Date(),
            subSystemName: this.getSubSystemName(),
        });
    }
}
