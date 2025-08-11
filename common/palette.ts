import {Colour} from "./colour";

export type ColourID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

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

export class Palette {
    constructor(private colours: Colour[]) {}

    to_array() {
        return this.colours.map(colour => colour.hex());
    }

    get_colour(id: ColourID) {
        return this.colours[id];
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
}
