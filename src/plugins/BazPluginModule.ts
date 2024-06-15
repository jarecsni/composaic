import { MyCoolExtensionType } from './BarPluginModule';

export class BazCoolExtensionImpl implements MyCoolExtensionType {
    saySomethingCool(): void {
        console.log('Doing something cool');
    }
}
