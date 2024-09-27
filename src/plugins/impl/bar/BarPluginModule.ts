import { Plugin } from '../../types.js';

export interface MyCoolExtensionType {
    saySomethingCool(): void;
}

export class SimpleCoolExtensionProvider implements MyCoolExtensionType {
    saySomethingCool(): void {
        // console.log('Saying something cool - well, default cool that is');
    }
}

export class BarPlugin extends Plugin implements MyCoolExtensionType {
    async start(): Promise<void> {
        // console.log('BarPlugin started');
    }
    async stop(): Promise<void> {
        // console.log('BarPlugin stopped');
        return Promise.resolve();
    }
    saySomethingCool(): void {
        // console.log('BarPlugin saying something cool is running');
        const extensions = this.getConnectedExtensions('MyCoolExtension');
        // console.log('connected extensions:', extensions.length);
        if (extensions) {
            extensions.forEach((extension) => {
                (
                    extension.extensionImpl as MyCoolExtensionType
                ).saySomethingCool();
            });
        }
    }
}
