import {Client} from "./client";
import {EventTransmitter} from "./event-transmitter";

export class Cursor extends EventTransmitter {
    x: number = 128;
    y: number = 128;
    pressed: boolean = false;

    constructor(client: Client) {
        super();
        this.on('cursor-move', (c, x, y) => {
            if (c === client) {
                this.x = x;
                this.y = y;
            }
        });

        this.on('cursor-down', c => {
            if (c === client) this.pressed = true;
        });

        this.on('cursor-up', c => {
            if (c === client) this.pressed = false;
        });
    }
}
