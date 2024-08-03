import {
    LoggerExtensionPoint,
    LogMessage,
    // @ts-expect-error - resolution not working
} from '@composaic/plugins/impl/logger';

import { Plugin } from 'composaic';

let idCounter = 0;

export class SimpleLoggerExtension implements LoggerExtensionPoint {
    objId = 0;
    constructor() {
        idCounter += 1;
        this.objId = idCounter;
    }
    log?: (message: LogMessage) => void;
    getSubSystemName(): string {
        return 'Test Plugin';
    }
    setLogCallback(log: (message: LogMessage) => void): void {
        this.log = log;
        console.log(
            `SimpleLoggerExtension setLogCallback called (ID=${this.objId})`
        );
        this.log({
            level: 'info',
            message: `Logger initialised with ${log}`,
            timestamp: new Date(),
            subSystemName: this.getSubSystemName(),
        });
    }
}

export class SimpleLoggerPlugin extends Plugin {
    extension?: SimpleLoggerExtension;
    async start() {
        super.start();
        // @ts-expect-error - resolution not working
        this.extension = this.getExtensionImpl('@composaic/logger', 'logger');
    }
    log(message: string) {
        if (this.extension !== undefined) {
            this.extension.log!({
                level: 'info',
                message,
                timestamp: new Date(),
                subSystemName: this.extension.getSubSystemName(),
            });
        }
    }
}
