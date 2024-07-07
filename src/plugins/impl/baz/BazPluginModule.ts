import { Plugin } from '../../types';
import { MyCoolExtensionType } from '../bar/BarPluginModule';

export class BazCoolExtensionImpl implements MyCoolExtensionType {
    saySomethingCool(): void {
        // console.log('Doing something cool');
    }
}

export class BazPlugin extends Plugin {}
