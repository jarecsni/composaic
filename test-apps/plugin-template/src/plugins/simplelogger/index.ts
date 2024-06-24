// @ts-expect-error - resolution not working
import { LoggerExtensionPoint } from '@composaic/plugins/impl/logger';

export class SimpleLoggerExtension implements LoggerExtensionPoint {
    log(message: string, ...args: unknown[]): void {
        console.log(message, ...args);
    }
    info(message: string, ...args: unknown[]): void {
        console.log(message, ...args);
    }
    debug(message: string, ...args: unknown[]): void {
        console.debug(message, ...args);
    }
    warn(message: string, ...args: unknown[]): void {
        console.warn(message, ...args);
    }
    error(message: string, ...args: unknown[]): void {
        console.error(message, ...args);
    }
}
