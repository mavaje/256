import {Socket} from "socket.io";
import {EventDown, EventUp} from "../common/event";
import {Server} from "./server";
import {Display} from "./display";
import {Palette} from "../common/palette";
import { EVT } from "./event-transmitter";

export class Client {
    id: string;
    disconnected: boolean = false;

    constructor(public socket: Socket<EventUp, EventDown>) {}

    attach_to(server: Server) {
        this.socket.on('client-id', id => {
            this.id = id;
            server.assign(this);
            console.log(`${this.id} connected`);

            EVT.emit('client-joined', this);
        });

        this.socket.on('disconnect', () => {
            this.disconnected = true;
            EVT.emit('client-left', this);
        });

        this.socket.on('cursor-move', (x, y) => EVT.emit('cursor-move', this, x, y));
        this.socket.on('cursor-down', (x, y) => EVT.emit('cursor-down', this, x, y));
        this.socket.on('cursor-up', (x, y) => EVT.emit('cursor-up', this, x, y));

        this.socket.on('key-down', key => console.log(`key-down: ${key}`));
        this.socket.on('key-up', key => console.log(`key-up: ${key}`));

        this.socket.on('button-down', (button, player) => console.log(`button-down: ${button}, ${player}`));
        this.socket.on('button-up', (button, player) => console.log(`button-up: ${button}, ${player}`));
    }

    send_palette(palette: Palette) {
        this.socket.emit('palette', palette.colours.map(colour => colour.hex()));
    }

    send_display(display: Display) {
        this.socket.emit('display', display.buffer());
    }
}
