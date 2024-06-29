import { Plugin } from '../../types';

export interface MyCoolExtensionType {
    saySomethingCool(): void;
}

export class SimpleCoolExtensionProvider implements MyCoolExtensionType {
    saySomethingCool(): void {
        console.log('Saying something cool - well, default cool that is');
    }
}

export class BarPlugin extends Plugin implements MyCoolExtensionType {
    start(): void {
        console.log('BarPlugin started');
    }
    stop(): void {
        console.log('BarPlugin stopped');
    }
    saySomethingCool(): void {
        console.log('BarPlugin saying something cool is running');
        const extensions = this.getConnectedExtensions('MyCoolExtension');
        console.log('connected extensions:', extensions.length);
        if (extensions) {
            extensions.forEach((extension) => {
                (
                    extension.extensionImpl as MyCoolExtensionType
                ).saySomethingCool();
            });
        }
    }
}
