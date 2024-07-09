import { config } from '../config';

export type NodeEnv = 'development' | 'production';
export type ComposaicEnv = 'dev' | 'prd';
export type EnvironmentConfiguration = {
    remotes: string[];
};
export type Configuration = {
    dev: EnvironmentConfiguration;
    prd: EnvironmentConfiguration;
};

const environmentMap: { [key in NodeEnv]: ComposaicEnv } = {
    development: 'dev',
    production: 'prd',
};

export class ConfigurationService {
    private static instance: ConfigurationService;
    private static configuration: Configuration;
    private static env: NodeEnv;
    private constructor() {
        // init
    }
    public static getInstance(
        configuration: Configuration = config
    ): ConfigurationService {
        if (!ConfigurationService.instance) {
            ConfigurationService.configuration = configuration;
            ConfigurationService.env =
                (process.env.NODE_ENV as NodeEnv) || 'development';
            ConfigurationService.instance = new ConfigurationService();
        }
        return ConfigurationService.instance;
    }
    getConfiguration = () => {
        return ConfigurationService.configuration[
            environmentMap[ConfigurationService.env]
        ];
    };
}

