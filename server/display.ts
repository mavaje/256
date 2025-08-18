import {Sprite} from "../common/sprite";
import {BLACK, RED, WHITE} from "../common/palette";
import {Cursor} from "./cursor";
import {EVT} from "./event-transmitter";

export class Display extends Sprite {
    protected _supports_transparency = false;

    private cursors: {
        [client_id: string]: Cursor;
    } = {};

    constructor() {
        super(256, 256);
        this.fill(BLACK);

        EVT.on('client-joined', client => {
            this.cursors[client.id] = new Cursor(client);
        });

        EVT.on('client-left', client => {
            this.cursors[client.id]?.destruct();
            delete this.cursors[client.id];
        });
    }

    update() {
        this.fill(BLACK);

        Object.values(this.cursors)
            .forEach(({x, y, pressed}) => {
                this.fill_rect(x - 5, y - 5, 10, 10, pressed ? RED : WHITE);
            });
    }

    buffer() {
        return this.pixels.buffer;
    }
}
