import crc32 from "crc-32";
import {ByteArray} from "../byte-array";

export class Chunk {

    array: ByteArray;

    constructor(
        public length: number,
        public name: string
    ) {
        this.array = new ByteArray(length + 12);
        this.array.push(length, 4);
        this.array.push(name);
    }

    calculate_crc() {
        const data = this.array.slice(4, this.length + 8);
        const crc = crc32.buf(data) >>> 0;
        this.array.push(crc, 4);
    }
}
