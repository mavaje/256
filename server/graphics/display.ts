import {
    AZURE,
    BLACK,
    BLUE, BROWN,
    ColourID, GOLD, GREEN, GREY,
    LIME, NAVY,
    ORANGE,
    PINK,
    PURPLE,
    RED,
    SILVER,
    WHITE,
    YELLOW
} from "../../common/palette";
import {Cursor} from "./cursor";
import {EVT} from "../event-transmitter";
import {Resources} from "../resources";
import {View} from "./ui/view";
import {ByteArray} from "../../common/byte-array";
import {Sprite} from "./sprite";

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
    }

    update(tick: number) {
        this.clear();
        // if (tick) return;

        const palette = Resources.palette();

        this.children.forEach(child => {
            child.render(this);
        });

        // const sprite = this.resource_provider.palette_file('neon').sprite;

        this.print(
            [
                ' !"#$%&\'()*+,-./',
                '0123456789:;<=>?',
                '@ABCDEFGHIJKLMNO',
                'PQRSTUVWXYZ[\\]^_',
                '`abcdefghijklmno',
                'pqrstuvwxyz{|}~'
            ].join('\n'),
            1, 9,
        );

        for (let id = 0; id < 16; id++) {
            this.fill_rect(8 * id, 64, 8, 28, id as ColourID);
            this.outline_rect(8 * id + 2, 66, 4, 4, palette.contrast[id] as ColourID);

            this.fill_rect(8 * id, 72, 8, 4, palette.darken[id] as ColourID);
            // this.fill_rect(8 * id + 2, 76, 4, 4, ({
            //     [BLACK]: BLACK,
            //     [WHITE]: SILVER,
            //     [GREY]: BLACK,
            //     [SILVER]: GREY,
            //     [BROWN]: BLACK,
            //     [GOLD]: BROWN,
            //     [GREEN]: NAVY,
            //     [NAVY]: BLACK,
            //     [RED]: BROWN,
            //     [ORANGE]: BROWN,
            //     [YELLOW]: GOLD,
            //     [LIME]: GREEN,
            //     [AZURE]: BLUE,
            //     [BLUE]: NAVY,
            //     [PURPLE]: NAVY,
            //     [PINK]: PURPLE,
            // }[id] ?? id) as ColourID);

            this.fill_rect(8 * id, 82, 8, 4, palette.lighten[id] as ColourID);
            // this.fill_rect(8 * id + 2, 86, 4, 4, ({
            //     [BLACK]: GREY,
            //     [WHITE]: WHITE,
            //     [GREY]: SILVER,
            //     [SILVER]: WHITE,
            //     [BROWN]: GOLD,
            //     [GOLD]: WHITE,
            //     [GREEN]: LIME,
            //     [NAVY]: BLUE,
            //     [RED]: PINK,
            //     [ORANGE]: YELLOW,
            //     [YELLOW]: WHITE,
            //     [LIME]: WHITE,
            //     [AZURE]: WHITE,
            //     [BLUE]: AZURE,
            //     [PURPLE]: PINK,
            //     [PINK]: WHITE,
            // }[id] ?? id) as ColourID);
        }

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
            });
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
