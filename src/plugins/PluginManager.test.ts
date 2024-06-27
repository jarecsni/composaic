import { PluginManager } from './PluginManager';
import { ClassConstructor, Plugin, PluginDescriptor } from './types';

describe('PluginManager', () => {
    it('should add a plugin', async () => {
        PluginManager.getInstance().addPlugin({
            module: 'BarPluginModule',
            package: 'bar',
            class: 'BarPlugin',
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
            module: 'BazPluginModule',
            package: 'baz',
            class: 'BazPlugin',
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
        const pluginBaz =
            await PluginManager.getInstance().getPlugin('@foo/baz');
        expect(pluginBaz).toBeDefined();
        expect(pluginBaz.extensions![0].id).toBe('MyCoolExtension');
        expect(pluginBaz.extensions![0].plugin).toBe('@foo/bar');
        expect(pluginBaz.extensions![0].className).toBe('BazCoolExtensionImpl');
        expect(pluginBaz.dependencies!).toEqual([]);
        const pluginBar =
            await PluginManager.getInstance().getPlugin('@foo/bar');
        expect(pluginBar.dependencies!).toHaveLength(1);
        expect((pluginBar.dependencies![0] as PluginDescriptor).plugin).toBe(
            '@foo/baz'
        );
    });
    it('should be able to load a plugin with self extension', async () => {
        PluginManager.getInstance().addPlugin({
            module: 'BarPluginModule',
            package: 'bar',
            class: 'BarPlugin',
            plugin: '@foo/bar',
            version: '1.0',
            description: 'bar',
            extensionPoints: [
                {
                    id: 'MyCoolExtension',
                    type: 'MyCoolExtensionType',
                },
            ],
            extensions: [
                {
                    plugin: 'self',
                    id: 'MyCoolExtension',
                    className: 'SimpleCoolExtensionProvider',
                },
            ],
        });
        PluginManager.getInstance().addPlugin({
            module: 'BazPluginModule',
            package: 'baz',
            class: 'BazPlugin',
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

        const loadedPlugin =
            await PluginManager.getInstance().loadPlugin('@foo/bar');
        expect(loadedPlugin).toBeDefined();
        expect(loadedPlugin.getPluginDescriptor().extensions![0].id).toBe(
            'MyCoolExtension'
        );
        expect(loadedPlugin.getPluginDescriptor().extensions![0].plugin).toBe(
            'self'
        );
        const ExtensionClass = loadedPlugin.getPluginDescriptor().extensions![0]
            .impl! as ClassConstructor;
        const extension = new ExtensionClass();
        expect(extension.saySomethingCool).toBeDefined();
        expect(
            loadedPlugin.getPluginDescriptor().extensionPoints![0].impl
        ).toHaveLength(2);
        const ExtClass = loadedPlugin.getPluginDescriptor().extensionPoints![0]
            .impl![0].extensionImpl as ClassConstructor;
        new ExtClass().saySomethingCool();
        const ExtClass2 = loadedPlugin.getPluginDescriptor().extensionPoints![0]
            .impl![1].extensionImpl as ClassConstructor;
        new ExtClass2().saySomethingCool();
    });
});
