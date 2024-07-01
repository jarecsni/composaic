import { convertManifestToPluginDescriptor } from './local-plugin-utils';

describe('local-plugin-utils', () => {
    it('should convert remote manifest to plugin descriptor', () => {
        // Arrange
        const manifest = {
            plugins: [
                {
                    remote: {
                        name: 'test',
                        url: 'http://test.com',
                    },
                    definitions: [
                        {
                            package: 'test-package',
                            module: 'test-module',
                            class: 'test-class',
                            plugin: 'test-plugin',
                            version: '1.0.0',
                            description: 'test-description',
                            extensionPoints: [
                                {
                                    id: 'test-id',
                                    type: 'test-type',
                                },
                            ],
                            extensions: [
                                {
                                    plugin: 'test-plugin',
                                    id: 'test-id',
                                    className: 'test-class',
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        // Act
        const result = convertManifestToPluginDescriptor(manifest);
        expect(result).toEqual([
            {
                module: 'test-module',
                package: 'test-package',
                class: 'test-class',
                plugin: 'test-plugin',
                version: '1.0.0',
                description: 'test-description',
                extensionPoints: [
                    {
                        id: 'test-id',
                        type: 'test-type',
                    },
                ],
                extensions: [
                    {
                        plugin: 'test-plugin',
                        id: 'test-id',
                        className: 'test-class',
                    },
                ],
            },
        ]);
    });
});
