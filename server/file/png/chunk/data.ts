import {Chunk} from "./chunk";
import {Sprite} from "../../../../common/sprite";
import zlib from "zlib";
import {ByteArray} from "../byte-array";

export class Data extends Chunk {
    constructor(image: Sprite) {
        const raw = new ByteArray(image.height + image.pixels.length / 2);

        for (let y = 0; y < image.height; y++) {
            raw.push(0);
            for (let x = 0; x < image.width; x += 2) {
                raw.push(
                    (image.get_pixel(x, y) << 4)
                    + image.get_pixel(x + 1, y)
                );
            }
        }

        const data = zlib.deflateSync(raw);

        super(data.length, 'IDAT');

        this.array.push(data);

        this.calculate_crc();
    }
}
