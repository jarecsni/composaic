import ConfigurationService, {
    Configuration,
    NodeEnv,
    getConfiguration,
} from './configuration';

describe('configuration', () => {
    const config: Configuration = {
        dev: {
            remotes: ['http://localhost:3000/assets/remoteEntry.js'],
        },
        prd: {
            remotes: ['http://some.host/assets/remoteEntry.js'],
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
        console.log(process.env.NODE_ENV);
        expect(
            ConfigurationService.getInstance(config).getConfiguration().remotes
        ).toEqual(['http://localhost:3000/assets/remoteEntry.js']);
    });
});
