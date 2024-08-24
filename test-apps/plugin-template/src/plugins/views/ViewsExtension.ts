import { Plugin } from 'composaic';
// @ts-expect-error this not working in VSC
import { ViewsExtensionPoint } from '@composaic/plugins/views';
export { PluginTestComponent } from './PluginTestComponent';

export class ViewsExtensionPlugin extends Plugin {}

export class SimpleViewsExtension implements ViewsExtensionPoint {}
