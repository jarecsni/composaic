
/**
 * Represents the global scope service.
 */
declare global {
    interface Window {
        __composaic_singletonInstances__?: Map<string, unknown>;
    }
}

/**
 * Represents the mapping of service types.
 */
interface ServiceTypeMapping {
    GlobalScopeService: GlobalScopeService;
    // Add other services here as needed
}

/**
 * Represents the global scope service class.
 */
export class GlobalScopeService {
    private static readonly instanceKey = 'GlobalScopeService';

    private constructor() { }

    /**
     * Gets the singleton instance of the GlobalScopeService.
     * @returns The singleton instance of the GlobalScopeService.
     */
    public static getInstance(): GlobalScopeService {
        if (!window.__composaic_singletonInstances__) {
            window.__composaic_singletonInstances__ = new Map<string, unknown>();
        }
        if (!window.__composaic_singletonInstances__.has(GlobalScopeService.instanceKey)) {
            window.__composaic_singletonInstances__.set(GlobalScopeService.instanceKey, new GlobalScopeService());
        }
        return window.__composaic_singletonInstances__.get(GlobalScopeService.instanceKey) as GlobalScopeService;
    }

    /**
     * Sets the singleton instance of a service.
     * @param key - The key associated with the service type.
     * @param instance - The instance of the service.
     */
    public static setSingletonInstance<K extends keyof ServiceTypeMapping>(key: K, instance: ServiceTypeMapping[K]): void {
        if (!window.__composaic_singletonInstances__) {
            console.error('Global singleton map is not initialized.');
            return;
        }
        window.__composaic_singletonInstances__.set(key, instance);
    }

    /**
     * Gets the singleton instance of a service.
     * @param key - The key associated with the service type.
     * @returns The singleton instance of the service, or undefined if not found.
     */
    public static getSingletonInstance<K extends keyof ServiceTypeMapping>(key: K): ServiceTypeMapping[K] | undefined {
        return window.__composaic_singletonInstances__?.get(key) as ServiceTypeMapping[K] | undefined;
    }
}