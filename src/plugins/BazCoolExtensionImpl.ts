import { MyCoolExtensionType } from './PluginManager.test';

export class BazCoolExtensionImpl implements MyCoolExtensionType {
    doSomethingCool(): void {
        console.log('Doing something cool');
    }
}
