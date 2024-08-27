import { Plugin } from '../../types';

/**
 * Signals extension point.
 */
export interface SignalsExtensionPoint {
}

export class SignalsPlugin extends Plugin {
    async start() {
        super.start();
        this.getConnectedExtensions('signals').forEach((extension) => {
            const signalExtension =
                extension.extensionImpl as SignalsExtensionPoint;
        });
    }
    async stop() { }
}

