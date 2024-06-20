export const config = {
    development: {
        id: 'dev',
        plugins: [
            {
                name: 'SimplePlugin',
                url: 'http://localhost:3001/remoteEntry.js',
                module: './SimplePlugin',
            }
        ]
    },
    production: {
        id: 'prd',
        plugins: [
        ]
    }
};