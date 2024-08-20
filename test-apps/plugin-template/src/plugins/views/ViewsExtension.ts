import { Plugin } from 'composaic'
// @ts-expect-error this not working in VSC
import { ViewsExtensionPoint } from '@composaic/plugins/views';

export class ViewsExtensionsPlugin extends Plugin {

}

export class SimpleViewsExtension implements ViewsExtensionPoint {

}