import { MyCoolExtensionType } from './BarPluginModule';

export class BazCoolExtensionImpl implements MyCoolExtensionType {
    doSomethingCool(): void {
        console.log('Doing something cool');
    }
}
