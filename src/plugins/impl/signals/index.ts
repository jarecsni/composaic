import { Plugin } from '../../types';

export type SignalDefinition = {
    signal: string;
    handler: string;
    plugin: string;
};

/**
 * Signals extension point.
 */
export interface SignalsExtensionPoint {}

export class SignalsPlugin extends Plugin {
    signals: { [key: string]: SignalDefinition } = {};
    async start() {
        super.start();
        const connectedExtensions = this.getConnectedExtensions('signals');
        connectedExtensions &&
            connectedExtensions.forEach((extension) => {
                const signalDefinition = extension.meta! as SignalDefinition[];
                for (const item of signalDefinition) {
                    item.plugin = extension.plugin;
                    this.signals[item.signal] = item;
                }
            });
    }
    async stop() {}
    getSignalDefinition(signalType: string): SignalDefinition | undefined {
        return this.signals[signalType];
    }
}
