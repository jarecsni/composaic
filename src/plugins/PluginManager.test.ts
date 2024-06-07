import { PluginManager } from './PluginManager';

export interface MyCoolExtensionType {
    doSomethingCool(): void;
}

describe('PluginManager', () => {
    it('should add a plugin', async () => {
        PluginManager.getInstance().addPlugin({
            module: './BarPluginModule',
            plugin: '@foo/bar',
            version: '1.0',
            description: 'bar',
            extensionPoints: [
                {
                    id: 'MyCoolExtension',
                    type: 'MyCoolExtensionType',
                },
            ],
        });
        PluginManager.getInstance().addPlugin({
            module: './BazPluginModule',
            plugin: '@foo/baz',
            version: '1.0',
            description: 'baz',
            extensions: [
                {
                    plugin: '@foo/bar',
                    id: 'MyCoolExtension',
                    className: 'BazCoolExtensionImpl',
                },
            ],
        });
        const plugin = await PluginManager.getInstance().getPlugin('@foo/baz');
        expect(plugin).toBeDefined();
        expect(plugin.extensions![0].id).toBe('MyCoolExtension');
        expect(plugin.extensions![0].plugin).toBe('@foo/bar');
        expect(plugin.extensions![0].className).toBe('BazCoolExtensionImpl');

        const loadedPlugin =
            await PluginManager.getInstance().loadPlugin('@foo/baz');
        expect(loadedPlugin).toBeDefined();
        expect(loadedPlugin.extensions![0].id).toBe('MyCoolExtension');
        expect(loadedPlugin.extensions![0].plugin).toBe('@foo/bar');
        const ExtensionClass = loadedPlugin.extensions![0].impl;
        // new BazCoolExtensionImpl().doSomethingCool();
        // @ts-expect-error - we know this is a class
        // new ExtensionClass().doSomethingCool();
        expect(new ExtensionClass().doSomethingCool).toBeDefined();
    });
});
