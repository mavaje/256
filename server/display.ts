import {AZURE, BLACK, BLUE, ColourID, LIME, ORANGE, PINK, PURPLE, RED, YELLOW} from "../common/palette";
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

        Object.values(this.cursors)
            .forEach(({x, y, pressed}) => {
                [
                    RED,
                    ORANGE,
                    YELLOW,
                    LIME,
                    AZURE,
                    BLUE,
                    PURPLE,
                    PINK,
                ].forEach((colour: ColourID, i) => {
                    const angle = i * Math.PI / 4 + tick / 8;
                    this.fill_rect(
                        x + 6 * Math.sin(angle) - 1,
                        y + 6 * Math.cos(angle) - 1,
                        2,
                        2,
                        colour,
                    );
                });

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
