import {Chunk} from "./chunk";
import {Colour} from "../../../../common/colour";

export class Palette extends Chunk {
    constructor(colours: Colour[]) {
        super(3 * colours.length, 'PLTE');

        colours.forEach(colour => {
            const [r, g, b] = colour.rgb_bytes();
            this.array.push(r);
            this.array.push(g);
            this.array.push(b);
        });

        this.calculate_crc();
    }
}
