import { BarPlugin } from './impl/bar/BarPluginModule';
import { PluginManager } from './PluginManager';
import { PluginDescriptor } from './types';

describe('PluginManager', () => {
    let pluginManager: PluginManager;
    describe('using unresolved descriptors', () => {
        beforeEach(() => {
            pluginManager = PluginManager.getInstance();
            pluginManager.clear();
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

            await PluginManager.getInstance().addPlugin(bazPlugin);
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

    describe('Observability', () => {
        beforeEach(() => {
            pluginManager = PluginManager.getInstance();
            pluginManager.clear();
        });
        it('should notify listeners when a plugin changes', async () => {
            const callback = jest.fn();
            const pluginIds = ['@foo/bar'];

            const unsubscribe = pluginManager.registerPluginChangeListener(
                pluginIds,
                callback
            );

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
            await PluginManager.getInstance().addPlugin(barDescriptor);
            expect(callback).toHaveBeenCalledWith(barDescriptor.plugin);
            unsubscribe();
        });

        it('should not notify listeners after they unsubscribe', async () => {
            const callback = jest.fn();
            const pluginIds = ['bar'];

            const unsubscribe = pluginManager.registerPluginChangeListener(
                pluginIds,
                callback
            );
            unsubscribe();

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

            await pluginManager.addPluginDefinitions([barDescriptor]);

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('When plugins added not in the order of dependency (out-of-order initialisation, E-E-EP)', () => {
        beforeEach(() => {
            pluginManager = PluginManager.getInstance();
            pluginManager.clear();
        });
        it('it should connect the extensions normally', async () => {
            // plugin providing extension point (others depend on this)
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

            // Baz offering extension for bar
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

            // Foo offering extension for bar
            const fooDescriptor: PluginDescriptor = {
                module: 'FooPluginModule',
                package: 'foo',
                class: 'FooPlugin',
                plugin: '@foo/foo',
                version: '1.0',
                description: 'foo',
                extensions: [
                    {
                        plugin: '@foo/bar',
                        id: 'MyCoolExtension',
                        className: 'FooCoolExtensionImpl',
                    },
                ],
            };
            fooDescriptor.loadedModule = await import(
                `./impl/${fooDescriptor.package}/${fooDescriptor.module}.ts`
            );

            // out of order addition
            await PluginManager.getInstance().addPlugin(bazDescriptor);
            await PluginManager.getInstance().addPlugin(fooDescriptor);
            await PluginManager.getInstance().addPlugin(barDescriptor);
            expect(barDescriptor.extensionPoints![0].impl).toHaveLength(2);
        });
    });

    /**
     * E-EP-E means plugin with extension, plugin with extension point, plugin with extension initialisation order
     */
    describe('When plugins added not in the order of dependency (out-of-order initialisation, E-EP-E)', () => {
        beforeEach(() => {
            pluginManager = PluginManager.getInstance();
            pluginManager.clear();
        });
        it('it should connect the extensions normally', async () => {
            const callback = jest.fn();
            const pluginIds = ['@foo/bar'];

            const unsubscribe = pluginManager.registerPluginChangeListener(
                pluginIds,
                callback
            );
            // plugin providing extension point (others depend on this)
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

            // Baz offering extension for bar
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

            // Foo offering extension for bar
            const fooDescriptor: PluginDescriptor = {
                module: 'FooPluginModule',
                package: 'foo',
                class: 'FooPlugin',
                plugin: '@foo/foo',
                version: '1.0',
                description: 'foo',
                extensions: [
                    {
                        plugin: '@foo/bar',
                        id: 'MyCoolExtension',
                        className: 'FooCoolExtensionImpl',
                    },
                ],
            };
            fooDescriptor.loadedModule = await import(
                `./impl/${fooDescriptor.package}/${fooDescriptor.module}.ts`
            );

            // out of order addition
            /**
             * If plugin with extension is added before plugin with extension point (baz -> bar) we get 1 notification for bar
             * However if we add the extension point first then the extension (bar then baz), we get 2 notifications for bar - why?
             * This is easy: add a plugin -> notification. Add an extension to the plugin -> notification. (When you add the extension
             * first there's no notification for the plugin with the extension point as it's not yet available in the registry.)
             * Also don't forget that here we only listen for change for bar, so we only get notifications for bar.
             */
            await PluginManager.getInstance().addPlugin(bazDescriptor);
            await PluginManager.getInstance().addPlugin(barDescriptor);
            expect(callback).toHaveBeenCalledWith(barDescriptor.plugin);
            expect(callback.mock.calls.length).toBe(1);

            callback.mockClear();
            expect(barDescriptor.extensionPoints![0].impl).toHaveLength(1);
            expect(barDescriptor.extensionPoints![0].impl![0].plugin).toBe(
                '@foo/baz'
            );
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/bar')
            ).toHaveLength(0);
            await PluginManager.getInstance().addPlugin(fooDescriptor);
            expect(callback).toHaveBeenCalledWith(barDescriptor.plugin);
            expect(barDescriptor.extensionPoints![0].impl).toHaveLength(2);
        });
    });
    /**
     * E(2)-EP1-EP2
     * Plugin A provides two extensions one for plugin B and one for plugin C. Plugin A added to the registry first, at this point it must be in
     * the awaiting list of B and C. Plugin B added next when A registers its extension, and remains in the registry for C. Plugin C added last when
     * B registers its extension, and now all plugins are connected.
     */
    describe('When plugins added not in the order of dependency (out-of-order initialisation, E-EP-E)', () => {
        beforeEach(() => {
            pluginManager = PluginManager.getInstance();
            pluginManager.clear();
        });
        it('it should connect the extensions normally', async () => {
            const callback = jest.fn();
            const pluginIds = ['@foo/bar', '@foo/foo', '@foo/baz'];

            const unsubscribe = pluginManager.registerPluginChangeListener(
                pluginIds,
                callback
            );

            // [Plugin A] Baz offering extension for bar (Plugin A) and foo (Plugin B)
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
                    {
                        plugin: '@foo/foo',
                        id: 'MyFooExtension',
                        className: 'BazFooExtensionImpl',
                    },
                ],
            };
            bazDescriptor.loadedModule = await import(
                `./impl/${bazDescriptor.package}/${bazDescriptor.module}.ts`
            );

            // plugin providing extension point (others depend on this)
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

            // Foo offering extension for bar
            const fooDescriptor: PluginDescriptor = {
                module: 'FooPluginModule',
                package: 'foo',
                class: 'FooPlugin',
                plugin: '@foo/foo',
                version: '1.0',
                description: 'foo',
                extensionPoints: [
                    {
                        id: 'MyFooExtension',
                        type: 'MyFooExtensionType',
                    },
                ],
            };
            fooDescriptor.loadedModule = await import(
                `./impl/${fooDescriptor.package}/${fooDescriptor.module}.ts`
            );

            // Add Plugin A
            await PluginManager.getInstance().addPlugin(bazDescriptor);
            expect(callback).toHaveBeenCalledWith(bazDescriptor.plugin);
            callback.mockClear();
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/bar')
            ).toHaveLength(1);
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/foo')
            ).toHaveLength(1);
            await PluginManager.getInstance().addPlugin(barDescriptor);
            expect(callback.mock.calls.length).toBe(2);
            expect(callback).toHaveBeenCalledWith(barDescriptor.plugin);
            expect(callback).toHaveBeenCalledWith(bazDescriptor.plugin);
            callback.mockClear();
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/bar')
            ).toHaveLength(0);
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/foo')
            ).toHaveLength(1);

            await PluginManager.getInstance().addPlugin(fooDescriptor);
            expect(callback.mock.calls.length).toBe(2);
            expect(callback).toHaveBeenCalledWith(fooDescriptor.plugin);
            expect(callback).toHaveBeenCalledWith(bazDescriptor.plugin);
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/bar')
            ).toHaveLength(0);
            expect(
                pluginManager.getAwaitingPluginsFor('@foo/foo')
            ).toHaveLength(0);
        });
    });
});
