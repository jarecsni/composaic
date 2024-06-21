import { Plugin } from '../../types';

export interface LoggerExtension {
    log(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

export class LoggerPlugin extends Plugin {

}
