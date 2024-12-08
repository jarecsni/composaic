import { PluginManager } from '../plugins/PluginManager.js';
import {
    ComposaicSubSystemName,
    LoggerPlugin,
} from '../plugins/impl/logger/index.js';

interface LogArgs {
    message: string;
    module?: string;
    header?: string;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'trace';

export class LoggingService {
    private static instance: LoggingService;
    private loggerPlugin: any;

    private constructor() {}

    public static async createInstance(
        reinitialise = false
    ): Promise<LoggingService> {
        if (!LoggingService.instance || reinitialise) {
            LoggingService.instance = new LoggingService();
            await LoggingService.instance.initLoggerPlugin();
        }
        return LoggingService.instance;
    }

    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            console.warn(
                'LoggingService instance not created. Call createInstance to create one.'
            );
        }
        return LoggingService.instance;
    }

    public info(args: LogArgs): void {
        this._log({ ...args, level: 'info' });
    }

    public warn(args: LogArgs): void {
        this._log({ ...args, level: 'warn' });
    }

    public error(args: LogArgs): void {
        this._log({ ...args, level: 'error' });
    }

    public debug(args: LogArgs): void {
        this._log({ ...args, level: 'debug' });
    }

    public trace(args: LogArgs): void {
        this._log({ ...args, level: 'trace' });
    }

    private _log(args: LogArgs & { level: LogLevel }): void {
        const { message, module, header, level } = args;
        const logEntry = {
            level,
            message,
            module,
            header,
            timestamp: new Date(),
            subSystemName: ComposaicSubSystemName, // Replace with actual subsystem name
        };

        if (this.loggerPlugin) {
            this.loggerPlugin.log(logEntry);
        } else {
            // Fallback to console logging if loggerPlugin is not available
            const padding = !logEntry.module || !logEntry.header ? ' ' : '';
            const logMessage = `[${logEntry.timestamp.toISOString()}][${logEntry.subSystemName}]${logEntry.module ? `[${logEntry.module}]` : ''}${logEntry.header ? `[${logEntry.header}] ` : ''}${padding}${logEntry.message}`;
            switch (level) {
                case 'error':
                    console.error(logMessage);
                    break;
                case 'warn':
                    console.warn(logMessage);
                    break;
                case 'info':
                    console.info(logMessage);
                    break;
                case 'debug':
                    console.debug(logMessage);
                    break;
                case 'trace':
                    console.trace(logMessage);
                    break;
                default:
                    console.log(logMessage);
                    break;
            }
        }
    }

    private async initLoggerPlugin(): Promise<void> {
        this.loggerPlugin = (await PluginManager.getInstance().getPlugin(
            '@composaic/logger',
            { reinitialise: true }
        )) as LoggerPlugin;
        this.loggerPlugin?.log({
            level: 'info',
            message: 'Logging Service initialised.',
            timestamp: new Date(),
            subSystemName: ComposaicSubSystemName,
        });
    }
}
