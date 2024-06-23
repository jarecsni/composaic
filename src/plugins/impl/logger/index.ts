import { Plugin } from '../../types';

/**
 * Logger extension point.
 *
 * Extensions for this extension point will need to implement these methods.
 */
export interface LoggerExtensionPoint {
    log(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

export class LoggerPlugin extends Plugin {}

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
