import {Sprite} from "../common/sprite";
import {BLACK} from "../common/palette";
import {Cursor} from "./cursor";
import {EVT} from "./event-transmitter";
import {ResourceProvider} from "./resource-provider";

export class Display extends Sprite {
    protected supports_transparency = false;

    private cursors: {
        [client_id: string]: Cursor;
    } = {};

    constructor(protected resource_provide: ResourceProvider) {
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

    update(tick: number) {
        this.clear();

        const sprite = this.resource_provide.sprite('neon');

        Object.values(this.cursors)
            .forEach(({x, y, pressed}) => {
                this.stamp(sprite, x, y);
            });
    }

    buffer() {
        return this.pixels.buffer;
    }
}
