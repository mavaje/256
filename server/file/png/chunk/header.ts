import {Chunk} from "./chunk";

type HeaderOptions = {
    bit_depth?: 1 | 2 | 4 | 8 | 16;
    colour_type?: 0 | 2 | 3 | 4 | 6;
    compression_method?: 0;
    filter_method?: 0;
    interlace_method?: 0 | 1;
};

export class Header extends Chunk {
    constructor(
        width: number,
        height: number,
        options: HeaderOptions = {},
    ) {
        super(13, 'IHDR');

        const {
            bit_depth = 8,
            colour_type = 0,
            compression_method = 0,
            filter_method = 0,
            interlace_method = 0,
        } = options;

        this.array.push(width, 4);
        this.array.push(height, 4);
        this.array.push(bit_depth);
        this.array.push(colour_type);
        this.array.push(compression_method);
        this.array.push(filter_method);
        this.array.push(interlace_method);

        this.calculate_crc();
    }
}
