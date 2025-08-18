import {Colour} from "./colour";

export type ColourID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export const BLACK = 0;
export const WHITE = 1;
export const GREY = 2;
export const SILVER = 3;
export const BROWN = 4;
export const GOLD = 5;
export const GREEN = 6;
export const NAVY = 7;
export const RED = 8;
export const ORANGE = 9;
export const YELLOW = 10;
export const LIME = 11;
export const AZURE = 12;
export const BLUE = 13;
export const PURPLE = 14;
export const PINK = 15;
export const TRANSPARENT = 16;

export const MAX_COLOUR_ID = 15;

export class Palette {
    constructor(public colours: Colour[]) {}

    to_array() {
        return this.colours.map(colour => colour.hex());
    }

    get_colour(id: ColourID) {
        return this.colours[id];
    }

    match(colour: Colour, discriminant?: number): ColourID {
        let nearest: ColourID = null;
        let distance: number = Infinity;
        for (const [i, c] of Object.entries(this.colours)) {
            const id = Number.parseInt(i) as ColourID;
            const d = c.distance(colour);
            if (d === 0) {
                return id;
            } else if (d < distance) {
                nearest = id;
                distance = d;
            }
        }
        return nearest;
    }

    black() {
        return this.get_colour(BLACK);
    }

    white() {
        return this.get_colour(WHITE);
    }

    grey() {
        return this.get_colour(GREY);
    }

    silver() {
        return this.get_colour(SILVER);
    }

    brown() {
        return this.get_colour(BROWN);
    }

    gold() {
        return this.get_colour(GOLD);
    }

    green() {
        return this.get_colour(GREEN);
    }

    navy() {
        return this.get_colour(NAVY);
    }

    red() {
        return this.get_colour(RED);
    }

    orange() {
        return this.get_colour(ORANGE);
    }

    yellow() {
        return this.get_colour(YELLOW);
    }

    lime() {
        return this.get_colour(LIME);
    }

    azure() {
        return this.get_colour(AZURE);
    }

    blue() {
        return this.get_colour(BLUE);
    }

    purple() {
        return this.get_colour(PURPLE);
    }

    pink() {
        return this.get_colour(PINK);
    }

    transparent() {
        return null;
    }
}
