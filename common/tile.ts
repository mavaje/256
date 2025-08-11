import {ColourID} from "./palette";

export class Tile {
    pixels: Uint8Array;

    constructor(
        public width: number,
        public height: number,
        buffer?: ArrayBufferLike,
    ) {
        this.pixels = buffer
            ? new Uint8Array(buffer)
            : new Uint8Array(width * height);
    }

    get_colour(x: number, y: number): ColourID {
        return this.pixels[y * this.height + x] as ColourID;
    }

    set_colour(x: number, y: number, colour: ColourID): void {
        this.pixels[y * this.height + x] = colour;
    }

    randomise() {
        for (let x = 0; x < this.width; x++) for (let y = 0; y < this.height; y++) {
            this.set_colour(x, y, Math.floor(16 * Math.random()) as ColourID);
        }
    }
}
