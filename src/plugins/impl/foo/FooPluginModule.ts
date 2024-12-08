import { Plugin } from '../../types.js';
import { MyCoolExtensionType } from '../bar/BarPluginModule.js';

export interface MyFooExtensionType {
    saySomethingFoo(): void;
}

export class FooCoolExtensionImpl implements MyCoolExtensionType {
    saySomethingCool(): void {
        // console.log('Doing something cool');
    }
}

export class FooPlugin extends Plugin {}
