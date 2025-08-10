import {EventDown, EventUp} from "../api/event";
import {io, Socket} from "socket.io-client";

export class Client {
    static COOKIE_ID_KEY = 'player_id';

    id: string = null;
    socket: Socket<EventDown, EventUp> = null;

    constructor() {
        this.id = Client.get_cookie(Client.COOKIE_ID_KEY);
    }

    static get_cookie(key: string) {
        return document.cookie.match(new RegExp(`${key}\s*=\s*([^;\s]+)`))?.[1];
    }

    static set_cookie(key: string, value: any) {
        document.cookie = `${key}=${value}`;
    }

    start() {
        this.socket = io();

        this.socket.on('connect', () => {
            this.socket.emit('client-id', this.id);
        });
    }
}
