import {EventDown, EventUp} from "../common/event";
import {io, Socket} from "socket.io-client";
import {Canvas} from "./canvas";
import {Palette} from "../common/palette";
import {Colour} from "../common/colour";

export class Client {
    static COOKIE_ID_KEY = 'player_id';

    id: string = null;
    socket: Socket<EventDown, EventUp> = null;

    canvas = new Canvas();

    constructor() {
        this.id = Client.get_id_cookie();
    }

    static get_id_cookie() {
        return document.cookie.match(new RegExp(`${Client.COOKIE_ID_KEY}\s*=\s*([^;\s]+)`))?.[1];
    }

    static set_id_cookie(value: any) {
        document.cookie = `${Client.COOKIE_ID_KEY}=${value}`;
    }

    start() {
        this.socket = io();
        this.socket.on('connect', () => {
            if (!this.id) {
                this.id = this.socket.id;
                Client.set_id_cookie(this.id);
            }

            this.socket.emit('client-id', this.id);

            this.socket.on('palette', palette => {
                this.canvas.palette = new Palette(palette.map(Colour.from_hex));
            });

            this.socket.on('display', buffer => {
                this.canvas.update(buffer);
                if (!this.canvas.element.isConnected) {
                    document.body.append(this.canvas.element);
                }
            });
        });
    }
}

if (require.main === module) {
    const client = new Client();
    client.start();
}
