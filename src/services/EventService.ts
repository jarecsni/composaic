declare global {
    var __GlobalEventServiceInstance__: EventService | undefined;
}

// Use a unique, application-specific key to store the instance
const GLOBAL_EVENT_SERVICE_KEY = '__GlobalEventServiceInstance__';

import { EventType, Handler } from 'mitt';
import { LocalEventBus } from '../plugins/impl/views/LocalEventBus.js';

export class EventService {
    private static instance: EventService;
    private eventBus: LocalEventBus;

    private constructor() {
        this.eventBus = new LocalEventBus();
    }

    public static getInstance(): EventService {
        // Check for the existence of a global object. Use `globalThis` which is standard across environments.
        if (!globalThis[GLOBAL_EVENT_SERVICE_KEY]) {
            globalThis[GLOBAL_EVENT_SERVICE_KEY] = new EventService();
        }

        // Ensure the instance property of this class also reflects the global instance
        EventService.instance = globalThis[GLOBAL_EVENT_SERVICE_KEY];

        return EventService.instance;
    }

    /**
     * Registers an event handler for the specified event type.
     * @param type - The event type to listen for.
     * @param handler - The event handler function.
     */
    on<T = any>(type: EventType, handler: Handler<T>) {
        this.eventBus.on(type, handler);
    }

    /**
     * Unregisters an event handler for the specified event type.
     * @param type - The event type to stop listening for.
     * @param handler - The event handler function to remove.
     */
    off<T = any>(type: EventType, handler: Handler<T>) {
        this.eventBus.off(type, handler);
    }

    /**
     * Emits an event of the specified type.
     * @param type - The event type to emit.
     * @param event - The event data to pass to the event handlers.
     */
    emit<T = any>(type: EventType, event?: T) {
        this.eventBus.emit(type, event);
    }
}
