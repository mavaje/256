import {Client} from "./client";

type ServerEvent = {
    'client-joined': (client: Client) => void,
    'client-left': (client: Client) => void,
    'cursor-move': (client: Client, x: number, y: number) => void,
    'cursor-down': (client: Client, x: number, y: number) => void,
    'cursor-up': (client: Client, x: number, y: number) => void,
};

export class EventTransmitter {

    private static LISTENERS: {
        [E in keyof ServerEvent]?: ServerEvent[E][];
    } = {};

    private listeners: {
        [E in keyof ServerEvent]?: ServerEvent[E][];
    } = {};

    on<E extends keyof ServerEvent>(event: E, listener: ServerEvent[E]) {
        EventTransmitter.LISTENERS[event] ??= [];
        EventTransmitter.LISTENERS[event].push(listener);

        this.listeners[event] ??= [];
        this.listeners[event].push(listener);
    }

    off<E extends keyof ServerEvent>(event: E, listener: ServerEvent[E]) {
        let global_index = EventTransmitter.LISTENERS[event]?.indexOf(listener);
        if (global_index >= 0) EventTransmitter.LISTENERS[event].splice(global_index, 1);

        const local_index = this.listeners[event]?.indexOf(listener);
        if (local_index >= 0) this.listeners[event].splice(global_index, 1);
    }

    destruct() {
        Object.entries(this.listeners)
            .forEach(([event, listeners]) => {
                listeners.forEach(listener =>
                    this.off(event as keyof ServerEvent, listener))
            });
    }

    emit<E extends keyof ServerEvent>(event: E, ...args: Parameters<ServerEvent[E]>) {
        EventTransmitter.LISTENERS[event]?.forEach(listener => {
            (listener as any)(...args);
        });
    }
}

export const EVT = new EventTransmitter();
