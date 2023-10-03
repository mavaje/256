import {Color, iPalette} from "../../api/palette";

export enum Colour {
    BLACK = 0,
    WHITE = 1,
    GREY = 2,
    SILVER = 3,
    RED = 4,
    BROWN = 5,
    ORANGE = 6,
    YELLOW = 7,
    GOLD = 8,
    LIME = 9,
    GREEN = 10,
    CYAN = 11,
    BLUE = 12,
    NAVY = 13,
    PURPLE = 14,
    PINK = 15,
}

export class Palette extends Array<Color> implements iPalette {

    static DEFAULT = new Palette(...[
        '#000000', '#ffffff', '#645b51', '#a0adad',
        '#ea401a', '#70472d', '#f17d22', '#ffc73d',
        '#e3b375', '#7dcc34', '#297537', '#2eeac8',
        '#0873b6', '#1e216b', '#582e7a', '#f5a8d9',
    ].map(Palette.rgb));

    static rgb(color: string) {
        color = color.replaceAll(/[^0-9a-f]/gi, '');
        return [
            color.slice(0, 2),
            color.slice(2, 4),
            color.slice(4, 6),
        ].map(hex => parseInt(hex, 16));
    }

}