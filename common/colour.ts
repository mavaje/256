export type Triplet = [number, number, number];

export type ColourSpace = 'rgb';

export class Colour {
    private space: ColourSpace;

    _hex: string;
    _rgb: Triplet;
    _oklab: Triplet;

    private constructor() {}

    static from_rgb(rgb: ArrayLike<number>) {
        const colour = new Colour();
        colour.space = 'rgb';
        colour._rgb = [0, 0, 0];
        colour._rgb[0] = rgb[0];
        colour._rgb[1] = rgb[1];
        colour._rgb[2] = rgb[2];
        return colour;
    }

    static from_hex(hex: string) {
        hex = hex.replace(/[^\da-f]/gi, '');
        const rgb = [0, 1, 2]
            .map(i => hex.length < 6
                ? hex[i].repeat(2)
                : hex.slice(2 * i, 2 * (i + 1))
            )
            .map(x => Number.parseInt(x, 16) || 0)
            .map(v => v / 255)
            .map(v => Math.max(v, 0))
            .map(v => Math.min(v, 1)) as Triplet;
        return Colour.from_rgb(rgb);
    }

    rgb(): Triplet {
        if (this._rgb) {
            return this._rgb;
        }
    }

    linear_rgb() {
        return this.rgb()
            .map(c => c <= 0.04045
                ? c / 12.92
                : ((c + 0.055) / 1.055) ** 2.4);
    }

    rgb_bytes(): Triplet {
        return this.rgb()
            .map(v => Math.round(v * 255)) as Triplet;
    }

    hex(): string {
        return this._hex ??= '#' + this.rgb_bytes()
            .map(v => v.toString(16))
            .map(x => x.padStart(2, '0'))
            .join('');
    }

    oklab(): Triplet {
        if (this._oklab) return this._oklab;

        let [r, g, b] = this.linear_rgb();

        const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
        const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
        const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

        return this._oklab = [
            0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
        ];
    }

    distance(colour: Colour) {
        const [l1, a1, b1] = this.oklab();
        const [l2, a2, b2] = colour.oklab();
        return Math.sqrt(
            (l1 - l2) ** 2
            + (a1 - a2) ** 2
            + (b1 - b2) ** 2
        );
    }
}
