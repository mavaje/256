import {BLACK, ColourID} from "../common/palette";
import {Cursor} from "./cursor";
import {EVT} from "./event-transmitter";
import {ResourceProvider} from "./resource-provider";
import {View} from "./ui/view";

export class Display extends View {
    protected supports_transparency = false;

    base_colour: ColourID = BLACK;

    private cursors: {
        [client_id: string]: Cursor;
    } = {};

    constructor(protected resource_provide: ResourceProvider) {
        super(0, 0, 256, 256);
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

        this.children.forEach(child => {
            child.render(this);
        });

        // if (tick) return;

        const sprite = this.resource_provide.sprite('neon');
        const scale = 4;

        this.stamp(
            sprite,
            128 - 8 * scale, 128 - 8 * scale,
            {
                scale,
                scale_x: 1,
                rotate: tick,
            },
        );

        Object.values(this.cursors)
            .forEach(({x, y, pressed}) => {
                // this.stamp(
                //     sprite,
                //     0, 0,
                //     {
                //         // scale_x: 1/2,
                //         // scale_y: 2,
                //         rotate: tick,
                //     },
                // );
            });
    }

    buffer() {
        return this.pixels.buffer;
    }
}
