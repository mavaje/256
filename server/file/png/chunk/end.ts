import {Chunk} from "./chunk";

export class End extends Chunk {
    constructor() {
        super(0, 'IEND');

        this.calculate_crc();
    }
}
