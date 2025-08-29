import {Client} from "../client";
import {EventTransmitter} from "../event-transmitter";

export class Cursor {
    x: number = 128;
    y: number = 128;
    pressed: boolean = false;

    readonly et = new EventTransmitter();

    constructor(public client: Client) {
        // super(0, 0, 16, 16);

        this.et.on('cursor-move', (c, x, y) => {
            if (c === client) {
                this.x = x;
                this.y = y;
            }
        });

        this.et.on('cursor-down', c => {
            if (c === client) this.pressed = true;
        });

        this.et.on('cursor-up', c => {
            if (c === client) this.pressed = false;
        });
    }

    destruct() {
        this.et.destruct();
    }
}
