import { Plugin } from '../../types.js';
import { MyCoolExtensionType } from '../bar/BarPluginModule.js';

export class BazCoolExtensionImpl implements MyCoolExtensionType {
    saySomethingCool(): void {
        // console.log('Doing something cool');
    }
}

export class BazPlugin extends Plugin {}
