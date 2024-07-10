import { PluginManager } from '../plugins/PluginManager';
import { ComposaicSubSystemName, LoggerPlugin } from '../plugins/impl/logger';

export class LoggingService {
    private static instance: LoggingService;
    private loggerPlugin?: LoggerPlugin;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    private async initLoggerPlugin(): Promise<void> {
        this.loggerPlugin = (await PluginManager.getInstance().getPlugin(
            '@composaic/logger'
        )) as LoggerPlugin;
        this.loggerPlugin.log({
            level: 'info',
            message: 'All OK! Logger initialised.',
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
            await instance.initLoggerPlugin();
            LoggingService.instance = instance;
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
    /**
     * Logs the specified message.
     * @param message - The message to be logged.
     */
    public info(message: string): void {
        // Your logging logic here
        this.loggerPlugin!.log({
            level: 'info',
            message: message,
            timestamp: new Date(),
            subSystemName: ComposaicSubSystemName,
        });
    }
}
