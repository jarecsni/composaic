import { PluginManager } from './PluginManager';
import { BarPlugin } from './impl/bar/BarPluginModule';
import { ClassConstructor, Plugin, PluginDescriptor } from './types';

describe('PluginManager', () => {
    describe('using unresolved descriptors', () => {
        beforeEach(() => {
            PluginManager.getInstance().clear();
        });
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
            const pluginBaz = (
                await PluginManager.getInstance().getPlugin('@foo/baz')
            ).pluginDescriptor;
            expect(pluginBaz).toBeDefined();
            expect(pluginBaz.extensions![0].id).toBe('MyCoolExtension');
            expect(pluginBaz.extensions![0].plugin).toBe('@foo/bar');
            expect(pluginBaz.extensions![0].className).toBe(
                'BazCoolExtensionImpl'
            );
            expect(
                (pluginBaz.dependencies![0] as PluginDescriptor).plugin
            ).toEqual('@foo/bar');
            const pluginBar = (
                await PluginManager.getInstance().getPlugin('@foo/bar')
            ).pluginDescriptor;
            expect(pluginBar.dependencies!).toHaveLength(1);
            expect(
                (pluginBar.dependencies![0] as PluginDescriptor).plugin
            ).toBe('@foo/baz');
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
            expect(
                loadedPlugin.getPluginDescriptor().extensions![0].plugin
            ).toBe('self');
            const extensionImpl =
                loadedPlugin.getPluginDescriptor().extensions![0].impl!;
            // @ts-expect-error - we know this is a function
            expect(extensionImpl.saySomethingCool).toBeDefined();
            expect(
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl
            ).toHaveLength(2);
            const ext1 =
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl![0]
                    .extensionImpl;
            // @ts-expect-error - we know this is a function
            // ext1.saySomethingCool();
            const ext2 =
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl![1]
                    .extensionImpl;
            // @ts-expect-error - we know this is a function
            // ext2.saySomethingCool();

            // connected extensions
            // loadedPlugin.getConnectedExtensions('MyCoolExtension').forEach((ext) => {
            //     console.log(ext.plugin, ext.extensionImpl);
            // })
        });
    });
    describe('using resolved descriptors', () => {
        beforeEach(async () => {
            PluginManager.getInstance().clear();
            const barPlugin: PluginDescriptor = {
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
            };
            barPlugin.loadedModule = await import(
                `./impl/${barPlugin.package}/${barPlugin.module}.ts`
            );

            PluginManager.getInstance().addPlugin(barPlugin);
            const bazPlugin: PluginDescriptor = {
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
            };
            bazPlugin.loadedModule = await import(
                `./impl/${bazPlugin.package}/${bazPlugin.module}.ts`
            );

            PluginManager.getInstance().addPlugin(bazPlugin);
        });
        it('should add a plugin with a loaded module', async () => {
            const loadedPlugin =
                await PluginManager.getInstance().loadPlugin('@foo/bar');
            expect(loadedPlugin).toBeDefined();
            expect(loadedPlugin.getPluginDescriptor().extensions![0].id).toBe(
                'MyCoolExtension'
            );
            expect(
                loadedPlugin.getPluginDescriptor().extensions![0].plugin
            ).toBe('self');
            const extensionImpl =
                loadedPlugin.getPluginDescriptor().extensions![0].impl!;
            // @ts-expect-error - we know this is a function
            expect(extensionImpl.saySomethingCool).toBeDefined();
            expect(
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl
            ).toHaveLength(2);
            const ext1 =
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl![0]
                    .extensionImpl;
            // @ts-expect-error - we know this is a function
            // ext1.saySomethingCool();
            const ext2 =
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl![1]
                    .extensionImpl;
            // @ts-expect-error - we know this is a function
            // ext2.saySomethingCool();

            // connected extensions
            (loadedPlugin as BarPlugin).saySomethingCool();
        });
    });
});
