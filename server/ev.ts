import {Client} from "./client";

type ServerEvent = {
    'new-client': (client: Client) => void,
};

export class EV {

    static listener_map: {
        [E in keyof ServerEvent]?: ServerEvent[E][];
    } = {};

    static on<E extends keyof ServerEvent>(event: E, listener: ServerEvent[E]) {
        EV.listener_map[event] ??= [];
        EV.listener_map[event].push(listener);
    }

    static off<E extends keyof ServerEvent>(event: E, listener: ServerEvent[E]) {
        const index = EV.listener_map[event]?.indexOf(listener);
        if (index >= 0) EV.listener_map[event].splice(index, 1);
    }

    static emit<E extends keyof ServerEvent>(event: E, ...args: Parameters<ServerEvent[E]>) {
        EV.listener_map[event]?.forEach(listener => {
            (listener as any)(...args);
        });
    }
}
