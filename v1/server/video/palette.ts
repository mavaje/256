import {RGB, iPalette} from "../../api/palette";
import {MathPlus} from "../../util/math-plus";

export enum Color {
    BLACK = 0,
    WHITE = 1,
    GREY = 2,
    SILVER = 3,
    RED = 4,
    BROWN = 5,
    ORANGE = 6,
    GOLD = 7,
    YELLOW = 8,
    LIME = 9,
    GREEN = 10,
    CYAN = 11,
    BLUE = 12,
    NAVY = 13,
    PURPLE = 14,
    PINK = 15,
}

export class Palette extends Array<RGB> implements iPalette {

    static NEON = new Palette(...[
        // '#000000', '#ffffff', '#3f5f7f', '#9fbfdf',
        // '#ff007f', '#7f1f00', '#ff4f00','#ff9f1f',
        // '#ffff00', '#3fff00', '#007f3f', '#00dfff',
        // '#005fff', '#1f007f', '#7f00bf', '#ff8fff',
        '#000000', '#ffffff', '#7f7f7f', '#bfbfbf',
        '#ff0000', '#7f0000', '#ffff00','#7f7f00',
        '#00ff00', '#007f00', '#00ffff', '#007f7f',
        '#0000ff', '#00007f', '#ff00ff', '#7f007f',
    ].map(Palette.hex_to_rgb));

    static validate_rgb(rgb: RGB): RGB {
        return rgb.map(x =>
            MathPlus.clamp(0, Math.round(x), 255)
        );
    }

    static hex_to_rgb(color: string) {
        color = color.replaceAll(/[^0-9a-f]/gi, '');
        return Palette.validate_rgb([
            color.slice(0, 2),
            color.slice(2, 4),
            color.slice(4, 6),
        ].map(hex => parseInt(hex, 16)));
    }

    static rgb_to_hsv([r, g, b]: RGB) {
        const v = Math.max(r, g, b);
        const d = v - Math.min(r, g, b);
        const s = v ? d / v : 0;
        const h = d ? {
            [r]: (g - b) / d + 6,
            [g]: (b - r) / d + 2,
            [b]: (r - g) / d + 4
        }[v] % 6 : 0;
        return [h, s, v / 255];
    }

    static hsv_to_rgb([h, s, v]: RGB) {
        h = ((h % 6) + 6) % 6;
        const c = 255 * v * (1 - s);
        const x = 255 * v * (1 - Math.abs(h % 2 - 1) * s);
        v *= 255;
        return Palette.validate_rgb([
            [v, x, c],
            [x, v, c],
            [c, v, x],
            [c, x, v],
            [x, c, v],
            [v, c, x]
        ][Math.floor(h)]);
    }

    update_color(i: number, rgb: RGB) {
        this[i] = Palette.validate_rgb(rgb);
    }
}