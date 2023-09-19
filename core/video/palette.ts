import {sleep_until} from "../util/time";

export function rgb(hex: string): Color {
    hex = hex.replaceAll(/[^0-9a-f]/gi, '');
    let r = 0, g = 0, b = 0;
    switch (hex.length) {
        case 0:
            break;
        case 1:
            r = g = b = 17 * parseInt(hex, 16);
            break;
        case 2:
            r = g = b = parseInt(hex, 16);
            break;
        case 3:
        case 4:
        case 5:
            [r, g, b] = hex.split('').map(x => 17 * parseInt(x, 16));
            break;
        case 6:
        default:
            [r, g, b] = [...hex.matchAll(/../g)].map(x => parseInt(x[0], 16));
            break;
    }
    return new Color(...[r, g, b].map(x => Math.max(0, Math.min(Math.floor(x), 255))));
}

export class Color extends Array {

    static BLACK = 0;
    static WHITE = 1;
    static GREY = 2;
    static SILVER = 3;
    static RED = 4;
    static BROWN = 5;
    static ORANGE = 6;
    static YELLOW = 7;
    static SAND = 8;
    static LIME = 9;
    static GREEN = 10;
    static CYAN = 11;
    static BLUE = 12;
    static NAVY = 13;
    static PURPLE = 14;
    static PINK = 15;

    get r() {
        return this[0] ?? 0;
    }

    get g() {
        return this[1] ?? 0;
    }

    get b() {
        return this[2] ?? 0;
    }

    get a() {
        return 255;
    }
}

export class Palette {

    static DEFAULT: Palette;

    colors: Color[];

    static async ready(): Promise<void> {
        return sleep_until(() => _ready);
    }

    constructor(colors: Color[] = []) {
        this.colors = colors.slice(0, 16);
    }

    color(i: number) {
        return this.colors[i] ?? new Color();
    }
}

let _ready = false;
// @ts-ignore
import(`./palettes/default.txt`)
    .then(({default: text}) => {
        const colors = text.split('\n').map(rgb);
        Palette.DEFAULT = new Palette(colors);
    })
    .catch(err => {
        console.log(err);
        Palette.DEFAULT = new Palette([
            rgb('#000000'),
            rgb('#ffffff'),
        ]);
    })
    .then(() => _ready = true);
