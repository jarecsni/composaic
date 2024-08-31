import { PluginManager } from '../plugins/PluginManager';
import { SignalsPlugin } from '../plugins/impl/signals';

export type Signal = {
    type: string;
    payload: any;
};

export class SignalService {
    private static instance: SignalService;
    private signalsPlugin?: SignalsPlugin; // Assume this is initialized correctly
    private isInitialized: boolean = false;

    private constructor() {
        // Private constructor to prevent direct construction calls with the `new` operator.
    }

    // New method to asynchronously initialize the service
    private async init(): Promise<void> {
        if (!this.isInitialized) {
            console.log('Initializing SignalService');
            const plugin =
                await PluginManager.getInstance().getPlugin(
                    '@composaic/signals'
                );
            console.log('Plugin loaded:', plugin);
            this.signalsPlugin = plugin as SignalsPlugin;
            this.isInitialized = true;
        }
    }

    public static async getInstance(): Promise<SignalService> {
        if (!SignalService.instance) {
            SignalService.instance = new SignalService();
            console.log('Awaiting SignalService initialization');
            await SignalService.instance.init(); // Ensure the instance is initialized before returning
            console.log('SignalService initialized');
        }
        return SignalService.instance;
    }

    async send(signal: Signal) {
        if (!this.isInitialized) {
            console.error('SignalService is not initialized.');
            return;
        }
        // Assuming getPlugin and getModule are async methods available in the system
        const signalDefinition = this.signalsPlugin!.getSignalDefinition(
            signal.type
        );
        if (signalDefinition) {
            const plugin = await PluginManager.getInstance().getPlugin(
                signalDefinition.plugin
            );
            const handlerFn = await plugin.getModule(signalDefinition.handler);
            if (handlerFn && typeof handlerFn === 'function') {
                handlerFn(signal.payload);
            } else {
                console.error(`Handler for ${signal.type} is not a function.`);
            }
        }
    }
}
