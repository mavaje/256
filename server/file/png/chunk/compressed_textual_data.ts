import {Chunk} from "./chunk";
import zlib from "zlib";

export class CompressedTextualData extends Chunk {
    constructor(keyword: string, text: string) {
        const data = zlib.deflateSync(text);

        super(keyword.length + 2 + data.length, 'zTXt');

        this.array.push(keyword);
        this.array.push(0);
        this.array.push(0);
        this.array.push(data);

        this.calculate_crc();
    }
}
