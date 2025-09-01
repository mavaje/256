import {File} from './file';
import {Palette, TRANSPARENT} from "../../common/palette";
import {Sprite} from "../graphics/sprite";
import {Chunk} from "./png/chunk";
import {ByteArray} from "../../common/byte-array";
import {Colour} from "../../common/colour/colour";
import {PNG} from "pngjs";
import {RGBColour} from "../../common/colour/rgb";

export type MappingMode = 'nearest' | 'random' | 'ordered';

export class PNGFile extends File {
    private static SIGNATURE = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    ]);

    static EXTENSION = 'png';

    public sprite: Sprite;
    public palette: Palette;

    protected constructor(
        name: string,
        path: string,
        extension: string = PNGFile.EXTENSION,
    ) {
        super(name, path, extension);
    }

    save(
        name?: string,
        path?: string,
        extension?: string,
    ) {
        const has_transparency = this.sprite.has_transparency();

        const chunks: Chunk[] = [];
        const bit_depth = has_transparency ? 8 : 4;

        chunks.push(Chunk.header(this.sprite.width, this.sprite.height, {
            bit_depth,
            colour_type: 3,
        }));

        if (has_transparency) {
            chunks.push(Chunk.palette([
                ...this.palette.colours.map(c => c.rgb_bytes()),
                [0, 0, 0],
            ]));

            const alphas = new ByteArray(17);
            alphas.fill(255, 0, 16);
            alphas[16] = 0;
            chunks.push(Chunk.palette_alpha(alphas.array()));
        } else {
            chunks.push(Chunk.palette(this.palette.colours.map(c => c.rgb_bytes())));
        }

        chunks.push(Chunk.data(this.sprite.array_2d(), bit_depth));

        chunks.push(Chunk.end());

        const length = chunks.reduce(
            (length, chunk) => length + chunk.length,
            PNGFile.SIGNATURE.length,
        );

        const data = new ByteArray(length);
        data.push(PNGFile.SIGNATURE);
        chunks.forEach(chunk => data.push(chunk));

        return super.save(data, name, path, extension);
    }

    load(palette: Palette = this.palette, mapping_mode: MappingMode = 'nearest') {
        this.palette = palette;

        const buffer = this.load_buffer();
        if (!buffer) return this;

        const bytes = new ByteArray(buffer);

        console.assert(
            PNGFile.SIGNATURE.every((byte, i) => byte === bytes[i]),
            `Incorrect PNG signature in ${this.filename()}`,
        );

        let index = 8;

        while (index < bytes.length) {
            const length = bytes.slice(index, index + 4).integer();
            const type = bytes.slice(index + 4, index + 8).string();
            const data = bytes.slice(index + 8, index + 8 + length);
            const crc = bytes.slice(index + 8 + length, index + 12 + length).integer() >>> 0;

            const chunk = new Chunk(type, data);
            console.assert(crc === chunk.crc(), `Invalid CRC for ${type} chunk`);

            // console.log(`found chunk ${chunk.type}:`, chunk.data);

            this.load_chunk(chunk);

            index += chunk.length;
        }

        if (!this.palette) {
            throw new Error('Palette not provided and not found!');
        }

        const png = PNG.sync.read(buffer);
        this.sprite = new Sprite(png.width, png.height);

        for (let i = 0; i < png.data.length; i += 4) {
            if (png.data[i + 3] < 128) {
                this.sprite.set_index(i / 4, TRANSPARENT);
            } else {
                const rgb = [...png.data.subarray(i, i + 3)].map(v => v / 255);
                const colour = RGBColour.from(rgb);
                this.sprite.set_index(i / 4, this.palette.match(colour));
            }
        }

        return this;
    }

    protected load_chunk(chunk: Chunk) {
        if (!this.palette && chunk.is_palette() && chunk.data.length === 48) {
            const colours: Colour[] = [];
            for (let i = 0; i < chunk.data.length; i += 3) {
                const rgb = chunk.data.slice(i, i + 3);
                const colour = RGBColour.from_bytes(rgb);
                colours.push(colour);
            }
            this.palette = new Palette(colours);
        }
    }
}
