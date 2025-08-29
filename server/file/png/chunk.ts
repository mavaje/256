import crc32 from "crc-32";
import {ByteArray} from "../../../common/byte-array";
import zlib from "zlib";
import {Triplet} from "../../../common/colour/colour";

type HeaderOptions = {
    bit_depth?: 1 | 2 | 4 | 8 | 16;
    colour_type?: 0 | 2 | 3 | 4 | 6;
    compression_method?: 0;
    filter_method?: 0;
    interlace_method?: 0 | 1;
};

export class Chunk extends ByteArray {

    data: ByteArray;

    constructor(
        public type: string,
        data: ArrayLike<number> = [],
    ) {
        super(data.length + 12);
        this.data = new ByteArray(data);

        this.push(this.length - 12, 4);
        this.push(this.type);
        this.push(this.data);
        this.push(this.crc(), 4);
    }

    crc(): number {
        const raw = new ByteArray(this.length - 8);
        raw.push(this.type);
        raw.push(this.data);
        return crc32.buf(new Uint8Array(raw)) >>> 0;
    }

    is_header() {
        return this.type === 'IHDR';
    }

    is_palette() {
        return this.type === 'PLTE';
    }

    is_data() {
        return this.type === 'IDAT';
    }

    width() {
        console.assert(this.is_header());
        return new ByteArray(this.data).slice(0, 4).integer();
    }

    height() {
        console.assert(this.is_header());
        return new ByteArray(this.data).slice(4, 8).integer();

    }

    header_options() {
        console.assert(this.is_header());
        const options: HeaderOptions = {};
        options.bit_depth = this.data[8] as HeaderOptions['bit_depth'];
        options.colour_type = this.data[9] as HeaderOptions['colour_type'];
        options.compression_method = this.data[10] as HeaderOptions['compression_method'];
        options.filter_method = this.data[11] as HeaderOptions['filter_method'];
        options.compression_method = this.data[12] as HeaderOptions['compression_method'];
        return options;
    }

    static header(width: number, height: number, options: HeaderOptions = {}) {
        const {
            bit_depth = 8,
            colour_type = 0,
            compression_method = 0,
            filter_method = 0,
            interlace_method = 0,
        } = options;

        const data = new ByteArray(13);
        data.push(width, 4);
        data.push(height, 4);
        data.push(bit_depth, 1);
        data.push(colour_type, 1);
        data.push(compression_method, 1);
        data.push(filter_method, 1);
        data.push(interlace_method, 1);

        return new Chunk('IHDR', data);
    }

    static palette(colours: Triplet[]) {
        const data = new ByteArray(3 * colours.length);

        colours.forEach(colour => data.push(colour));

        return new Chunk('PLTE', data);
    }

    static palette_alpha(alphas: number[]) {
        return new Chunk('tRNS', alphas);
    }

    static data(pixels: ArrayLike<ArrayLike<number>>, bit_depth: HeaderOptions['bit_depth']) {
        let raw: ByteArray;
        if (pixels.length > 0) {
            const width = pixels[0].length;
            const height = pixels.length;
            const length = height * (1 + width * bit_depth / 8);
            raw = new ByteArray(length);
            for (let y = 0; y < height; y++) {
                raw.push(0);
                switch (bit_depth) {
                    case 4:
                        for (let x = 0; x < width; x += 2) {
                            raw.push((pixels[y][x] << 4) + pixels[y][x + 1]);
                        }
                        break;
                    case 8:
                        raw.push(pixels[y]);
                        break;
                    default:
                        throw new Error(`Can't encode PNG data to bit-depth ${bit_depth} yet!`);
                }
            }
        } else {
            raw = new ByteArray(0);
        }

        const data = zlib.deflateSync(raw);

        return new Chunk('IDAT', data);
    }

    static text(keyword: string, text: string) {
        const length = keyword.length + 1 + text.length;

        const data = new ByteArray(length);
        data.push(keyword);
        data.push(0);
        data.push(text);

        return new Chunk('tEXt', data);
    }

    static compressed_text(keyword: string, text: string) {
        const text_data = zlib.deflateSync(text);
        const length = keyword.length + 2 + text_data.length;

        const data = new ByteArray(length);
        data.push(keyword);
        data.push(0);
        data.push(0);
        data.push(text_data);

        return new Chunk('zTXt', data);
    }

    static end() {
        return new Chunk('IEND');
    }
}
