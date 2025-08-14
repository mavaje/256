import {Sprite} from "../common/sprite";
import {BLACK, Palette, RED, WHITE} from "../common/palette";
import {readFile} from "node:fs/promises";
import {Colour} from "../common/colour";
import {Cursor} from "./cursor";
import {EVT} from "./event-transmitter";

export class Display extends Sprite {

    private cursors: {
        [client_id: string]: Cursor;
    } = {};

    public palette: Palette;

    constructor() {
        super(256, 256);

        EVT.on('client-joined', client => {
            this.cursors[client.id] = new Cursor(client);
        });

        EVT.on('client-left', client => {
            this.cursors[client.id]?.destruct();
            delete this.cursors[client.id];
        });
    }

    async load_palette(name: string) {
        const filename = `resources/palettes/${name}.pal`;
        const content = await readFile(filename, 'utf8');
        this.palette = new Palette(content
            .split('\n')
            .filter(Boolean)
            .map(Colour.from_hex));
    }

    update() {
        this.flood(BLACK);

        Object.values(this.cursors)
            .forEach(({x, y, pressed}) => {
                this.draw_rect(x, y, x + 10, y + 10, pressed ? RED : WHITE);
            });
    }
}
