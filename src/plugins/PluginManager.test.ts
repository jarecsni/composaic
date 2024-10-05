import { PluginManager } from './PluginManager';
import { BarPlugin } from './impl/bar/BarPluginModule';
import { PluginDescriptor } from './types';

describe('PluginManager', () => {
    describe('using unresolved descriptors', () => {
        beforeEach(() => {
            PluginManager.getInstance().clear();
        });
        it('should add a plugin', async () => {
            const barDescriptor: PluginDescriptor = {
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
            };
            barDescriptor.loadedModule = await import(
                `./impl/${barDescriptor.package}/${barDescriptor.module}.ts`
            );
            PluginManager.getInstance().addPlugin(barDescriptor);

            const bazDescriptor: PluginDescriptor = {
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
            bazDescriptor.loadedModule = await import(
                `./impl/${bazDescriptor.package}/${bazDescriptor.module}.ts`
            );
            PluginManager.getInstance().addPlugin(bazDescriptor);
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
            const barDescriptor: PluginDescriptor = {
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
            barDescriptor.loadedModule = await import(
                `./impl/${barDescriptor.package}/${barDescriptor.module}.ts`
            );
            PluginManager.getInstance().addPlugin(barDescriptor);
            const bazDescriptor: PluginDescriptor = {
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
            bazDescriptor.loadedModule = await import(
                `./impl/${bazDescriptor.package}/${bazDescriptor.module}.ts`
            );
            PluginManager.getInstance().addPlugin(bazDescriptor);

            const loadedPlugin =
                await PluginManager.getInstance().getPlugin('@foo/bar');
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
            const ext2 =
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl![1]
                    .extensionImpl;
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
                await PluginManager.getInstance().getPlugin('@foo/bar');
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
            const ext2 =
                loadedPlugin.getPluginDescriptor().extensionPoints![0].impl![1]
                    .extensionImpl;
            (loadedPlugin as BarPlugin).saySomethingCool();
        });
    });
    describe('using resolved descriptors with dependencies', () => {
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
                await PluginManager.getInstance().getPlugin('@foo/baz');
            expect(loadedPlugin).toBeDefined();
            expect(loadedPlugin.getPluginDescriptor().extensions![0].id).toBe(
                'MyCoolExtension'
            );
            expect(
                loadedPlugin.getPluginDescriptor().extensions![0].plugin
            ).toBe('@foo/bar');
            const extensionImpl =
                loadedPlugin.getPluginDescriptor().extensions![0].impl!;
            // @ts-expect-error - we know this is a function
            expect(extensionImpl.saySomethingCool).toBeDefined();
            const barPlugin =
                await PluginManager.getInstance().getPlugin('@foo/bar');
            expect(
                barPlugin.getPluginDescriptor().extensionPoints![0].impl
            ).toHaveLength(2);
        });
    });
});
