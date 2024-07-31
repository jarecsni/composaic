import { Plugin } from 'composaic';
export { RemoteExamplePage } from './RemoteExamplePage';

export class NavbarExtensionPlugin extends Plugin {
    async start() {
        console.log('NavbarExtensionPlugin started');
    }
    async stop() {
        console.log('NavbarExtensionPlugin stopped');
    }
}

export class NavbarItemExtension {
    // TODO remove this as it's not needed
}
