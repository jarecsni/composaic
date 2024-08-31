import { EventType, Handler } from 'mitt';
import { LocalEventBus } from '../plugins/impl/views/LocalEventBus';

/**
 * Service for managing events using an event bus.
 */
export class EventService {
    private static instance: EventService;
    private eventBus: LocalEventBus;

    /**
     * Constructs a new instance of the EventService class.
     */
    private constructor() {
        this.eventBus = new LocalEventBus();
    }

    /**
     * Gets the singleton instance of the EventService class.
     * @returns The singleton instance of the EventService class.
     */
    public static getInstance(): EventService {
        if (!EventService.instance) {
            EventService.instance = new EventService();
        }
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
