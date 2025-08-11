import {Tile} from "./tile";
import {Palette} from "./palette";

export class Display extends Tile {

    public palette: Palette;

    constructor(buffer?: ArrayBufferLike) {
        super(256, 256, buffer);
    }
}
