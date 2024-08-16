import { PluginViewDefinition, ViewDefinition, ViewsPlugin } from '.';

describe('ViewsPlugin', () => {
    describe('consolidateViews', () => {
        it('should consolidate plugin view definitions', () => {
            const pluginViewDefinitions: PluginViewDefinition[] = [
                {
                    container: 'container1',
                    components: ['component1', 'component2'],
                    plugin: 'plugin1',
                },
                {
                    container: 'container2',
                    components: ['component3'],
                    plugin: 'plugin2',
                },
                {
                    container: 'container1',
                    components: ['component4'],
                    plugin: 'plugin3',
                },
            ];

            const expectedViewDefinitions: ViewDefinition[] = [
                {
                    container: 'container1',
                    components: [
                        { component: 'component1', plugin: 'plugin1' },
                        { component: 'component2', plugin: 'plugin1' },
                        { component: 'component4', plugin: 'plugin3' },
                    ],
                },
                {
                    container: 'container2',
                    components: [
                        { component: 'component3', plugin: 'plugin2' },
                    ],
                },
            ];

            const viewsPlugin = new ViewsPlugin();
            const consolidatedViews = viewsPlugin.consolidateViews(
                pluginViewDefinitions
            );

            expect(consolidatedViews).toEqual(expectedViewDefinitions);
        });
    });
});
