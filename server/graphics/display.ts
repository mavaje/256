import {
    AZURE,
    BLACK,
    BLUE, BROWN,
    ColourID, GOLD, GREEN, GREY,
    LIME, NAVY,
    ORANGE, Palette,
    PINK,
    PURPLE,
    RED,
    SILVER, TRANSPARENT,
    WHITE,
    YELLOW
} from "../../common/palette";
import {Cursor} from "./cursor";
import {EVT} from "../event-transmitter";
import {View} from "./ui/view";
import {ByteArray} from "../../common/byte-array";
import {Sprite} from "./sprite";
import {PNGFile} from "../file/png-file";
import {FontFile} from "../file/font-file";
import {Resources} from "../resources";
import {SpriteFile} from "../file/sprite-file";

export class Display extends View {
    protected supports_transparency = false;

    base_colour: ColourID = BLACK;

    private cursors: {
        [client_id: string]: Cursor;
    } = {};

    constructor() {
        super(0, 0, 256, 256);
        this.fill(BLACK);

        EVT.on('client-joined', client => {
            this.cursors[client.id] = new Cursor(client);
        });

        EVT.on('client-left', client => {
            this.cursors[client.id]?.destruct();
            delete this.cursors[client.id];
        });

        const font_file = Resources.font_file();

        font_file.save('mono2');
    }

    update(tick: number) {
        // if (tick) return;

        this.clear();

        // const font_file = Resources.font_file();
        // this.stamp(font_file.sprite);

        this.print('ABC123');

        this.render();

        Object.values(this.cursors)
            .forEach(cursor => {
                cursor.render(this, tick);
            });
    }

    render() {
        super.render(this, 0, 0);
    }

    buffer() {
        const array = new ByteArray(Math.ceil(this.pixels.length / 2));

        for (let i = 0; i < array.length; i++) {
            array[i] = this.pixels[2 * i] << 4 & 0xf0
                | this.pixels[2 * i + 1] & 0xf;
        }

        return array.buffer;
    }
}
