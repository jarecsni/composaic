export const config = {
    development: {
        id: 'dev',
        plugins: [
            {
                remote: {
                    name: 'SimplePlugin',
                    url: 'http://localhost:3001/remoteEntry.js',
                },
                definitions: [
                    {
                        module: './SimplePlugin',
                        plugin: '@foo/bar',
                        version: '1.0',
                        description: 'bar',
                        extensionPoints: [
                            {
                                id: 'MyCoolExtension',
                                type: 'MyCoolExtensionType',
                            },
                        ],
                    }
                ]
            }
        ]
    },
    production: {
        id: 'prd',
        plugins: [],
    },
};
