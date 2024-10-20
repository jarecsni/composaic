import { ConfigurationService, Configuration, NodeEnv } from './configuration';

describe('configuration', () => {
    const config: Configuration = {
        dev: {
            remotes: [
                {
                    name: 'remote1',
                    host: 'http://localhost:3000',
                    file: 'remoteEntry.js'
                }
            ],
        },
        prd: {
            remotes: [
                {
                    name: 'remote1',
                    host: 'http://localhost:9000',
                    file: 'remoteEntry.js'
                }
            ],
        },
    };
    let savedEnv: NodeEnv;
    beforeEach(() => {
        savedEnv = process.env.NODE_ENV as NodeEnv;
    });
    afterEach(() => {
        process.env.NODE_ENV = savedEnv;
    });
    it('should return the configuration', () => {
        process.env.NODE_ENV = 'development';
        expect(
            ConfigurationService.getInstance(config).getConfiguration().remotes
        ).toEqual(['http://localhost:3000/assets/remoteEntry.js']);
    });
});
