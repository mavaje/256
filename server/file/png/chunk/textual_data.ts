import {Chunk} from "./chunk";

export class TextualData extends Chunk {
    constructor(keyword: string, text: string) {
        super(keyword.length + 1 + text.length, 'tEXt');

        this.array.push(keyword);
        this.array.push(0);
        this.array.push(text);

        this.calculate_crc();
    }
}
