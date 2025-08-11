import {Socket} from "socket.io";
import {EventDown, EventUp} from "../common/event";
import {Server} from "./server";
import {Display} from "../common/display";
import {Palette} from "../common/palette";

export class Client {
    id: string;
    disconnected: boolean = false;

    constructor(public socket: Socket<EventUp, EventDown>) {}

    attach_to(server: Server) {
        this.socket.on('client-id', id => {
            this.id = id;
            server.assign(this);
            console.log(`${this.id} connected`);
        });

        this.socket.on('disconnect', () => {
            this.disconnected = true;
        });
    }

    send_palette(palette: Palette) {
        this.socket.emit('palette', palette.to_array());
    }

    send_display(display: Display) {
        this.socket.emit('display', display.pixels.buffer);
    }
}
