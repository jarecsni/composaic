import { Plugin } from '../../types.js';
import { MyCoolExtensionType } from '../bar/BarPluginModule.js';
import { MyFooExtensionType } from '../foo/FooPluginModule.js';

export class BazCoolExtensionImpl implements MyCoolExtensionType {
    saySomethingCool(): void {
        // console.log('Doing something cool');
    }
}

export class BazFooExtensionImpl implements MyFooExtensionType {
    saySomethingFoo(): void {
        // console.log('Doing something cool');
    }
}

export class BazPlugin extends Plugin {}
