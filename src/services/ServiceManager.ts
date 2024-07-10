import { LoggingService } from './LoggingService';

/**
 * Creates and initializes all services.
 *
 * This function is needed as Services usually obtain reference to a Plugin which is async, and this is not really
 * possible to do in the constructor of the service.
 */
export const createServices = async () => {
    await LoggingService.createInstance();
};
