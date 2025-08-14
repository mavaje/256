import {ColourID} from "./palette";

export class Sprite {
    pixels: Uint8ClampedArray;

    constructor(
        public width: number,
        public height: number,
    ) {
        this.pixels = new Uint8ClampedArray(width * height);
    }

    get_pixel(x: number, y: number): ColourID {
        return this.pixels[y * this.height + x] as ColourID;
    }

    set_pixel(x: number, y: number, colour: ColourID) {
        if (x >= 0 && x < this.width &&
            y >= 0 && y < this.height
        ) {
            this.pixels[y * this.height + x] = colour;
        }
    }

    flood(colour_id: ColourID) {
        this.draw_rect(0, 0, this.width, this.height, colour_id);
    }

    draw_rect(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        colour_id: ColourID,
    ) {
        for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) {
            this.set_pixel(x, y, colour_id);
        }
    }
}
