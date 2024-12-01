import { PluginManager } from '../plugins/PluginManager.js';
import {
    ComposaicSubSystemName,
    LogLevel,
    LoggerPlugin,
} from '../plugins/impl/logger/index.js';

export class LoggingService {
    private static instance: LoggingService;
    private loggerPlugin?: LoggerPlugin;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    private async initLoggerPlugin(): Promise<void> {
        this.loggerPlugin = (await PluginManager.getInstance().getPlugin(
            '@composaic/logger',
            { reinitialise: true }
        )) as LoggerPlugin;
        this.loggerPlugin.log({
            level: 'info',
            message: 'Logging Service initialised.',
            timestamp: new Date(),
            subSystemName: ComposaicSubSystemName,
        });
    }

    /**
     * Static method to create and initialize an instance of LoggingService.
     */
    public static async createInstance(): Promise<LoggingService> {
        if (!LoggingService.instance) {
            const instance = new LoggingService();
            LoggingService.instance = instance;
            PluginManager.getInstance().registerPluginChangeListener(
                ['@composaic/logger'],
                () => {
                    LoggingService.instance.initLoggerPlugin();
                }
            );
        }
        return LoggingService.instance;
    }

    /**
     * Returns the singleton instance of the LoggingService.
     * If the instance does not exist, it warns and suggests to call createInstance.
     * @returns The singleton instance of the LoggingService.
     */
    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            console.warn(
                'LoggingService instance not created. Call createInstance to create one.'
            );
        }
        return LoggingService.instance;
    }

    public info(message: string): void {
        this._log(message, 'info');
    }

    public error(message: string): void {
        this._log(message, 'error');
    }

    public debug(message: string): void {
        this._log(message, 'debug');
    }

    public warn(message: string): void {
        this._log(message, 'warn');
    }

    public trace(message: string): void {
        this._log(message, 'trace');
    }

    public fatal(message: string): void {
        this._log(message, 'fatal');
    }

    /**
     * Logs the specified message.
     * @param message - The message to be logged.
     */
    private _log(message: string, level: LogLevel): void {
        // Your logging logic here
        this.loggerPlugin?.log({
            level,
            message: message,
            timestamp: new Date(),
            subSystemName: ComposaicSubSystemName,
        });
    }
}
