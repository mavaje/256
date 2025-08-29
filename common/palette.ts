import {Colour} from "./colour/colour";

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

export type ColourMap = {
    [id in ColourID]?: ColourID;
};

export class Palette {

    public contrast: ColourMap;
    public darken: ColourMap;
    public lighten: ColourMap;

    constructor(public colours: Colour[]) {
        this.contrast = {};
        this.darken = {};
        this.lighten = {};
        colours.forEach((colour, id: ColourID) => {
            const [l, c, h] = colour.oklch();

            let contrast: [ColourID, number] = [id, 0];
            let darken: [ColourID, number] = [id, Infinity];
            let lighten: [ColourID, number] = [id, Infinity];

            colours.forEach((colour_2, id_2: ColourID) => {
                const [l2, c2, h2] = colour_2.oklch();
                const dl = Math.abs(l - l2);
                const dc = Math.abs(c - c2);
                let dh = Math.abs(h - h2) % (2 * Math.PI);
                if (dh > Math.PI) dh = 2 * Math.PI - dh;

                if (dl > contrast[1]) {
                    contrast = [id_2, dl];
                }

                if (l2 < l) {
                    // const score =
                    //     dl ** 2
                    //     + 16 * dc ** 2
                    //     + 4 * c * c2 * dh ** 2;

                    const score =
                        dl ** 2
                        + 4 * dc ** 2
                        + 2 * (c * c2) * dh ** 2;

                    if (score < darken[1]) {
                        darken = [id_2, score];
                    }
                } else if (l2 > l) {
                    // const score =
                    //     dl ** 2
                    //     + 1 * dc ** 2
                    //     + 1 * dh ** 2;
                    //
                    // if (score < lighten[1]) {
                    //     lighten = [id_2, score];
                    // }
                }
            });
            this.contrast[id] = contrast[0];
            this.darken[id] = darken[0];
            this.lighten[id] = lighten[0];
        });
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
}
