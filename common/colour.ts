export type Triplet<F extends string = never> = [number, number, number] & {
    [K in F]?: number;
};

export type RGB = Triplet<'r' | 'g' | 'b'>;
export type LAB = Triplet<'L' | 'a' | 'b'>;

export type ColourSpace = 'rgb' | 'oklab';

export class Colour {
    _hex: string;
    _rgb: RGB;
    _oklab: LAB;

    private constructor(private readonly space: ColourSpace) {}

    private static to_linear(value: number) {
        return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    }

    private static from_linear(value: number) {
        return value <= 0.0031308
            ? 12.92 * value
            : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    }

    static from_rgb(rgb: ArrayLike<number>) {
        const colour = new Colour('rgb');
        colour.set_rgb(...rgb as [number, number, number]);
        return colour;
    }

    static from_oklab(lab: ArrayLike<number>) {
        const colour = new Colour('oklab');
        colour.set_oklab(...lab as [number, number, number]);
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

    protected set_rgb(r: number, g: number, b: number) {
        this._rgb = [0, 0, 0];
        this._rgb.r = this._rgb[0] = r;
        this._rgb.g = this._rgb[1] = g;
        this._rgb.b = this._rgb[2] = b;
    }

    protected set_oklab(l: number, a: number, b: number) {
        this._oklab = [0, 0, 0];
        this._oklab.L = this._oklab[0] = l;
        this._oklab.a = this._oklab[1] = a;
        this._oklab.b = this._oklab[2] = b;
    }

    rgb(): RGB {
        if (!this._rgb) {
            switch (this.space) {
                case 'oklab':
                    const [L, a, b] = this._oklab;

                    let l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
                    let m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
                    let s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;

                    this.set_rgb(
                        Colour.from_linear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
                        Colour.from_linear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
                        Colour.from_linear(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
                    );

                    break;
            }
        }

        return this._rgb;
    }

    linear_rgb(): Triplet {
        return this.rgb().map(Colour.to_linear) as Triplet;
    }

    rgb_bytes(): Triplet {
        return this.rgb()
            .map(v => Math.min(Math.floor(v * 256), 255)) as Triplet;
    }

    hex(): string {
        return this._hex ??= '#' + this.rgb_bytes()
            .map(v => v.toString(16))
            .map(x => x.padStart(2, '0'))
            .join('');
    }

    oklab(): LAB {
        if (!this._oklab) {
            switch (this.space) {
                case 'rgb':
                    let [r, g, b] = this.linear_rgb();

                    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
                    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
                    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

                    this.set_oklab(
                        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
                        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
                        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
                    );

                    break;
            }

            return this._oklab;
        }

        if (this._oklab) return this._oklab;

    }

    in_space(space: ColourSpace): Triplet {
        switch (space) {
            case 'rgb':
                return this.rgb();
            case 'oklab':
                return this.oklab();
        }
    }

    distance(colour: Colour, space: ColourSpace = 'oklab') {
        const [a1, b1, c1] = this.in_space(space);
        const [a2, b2, c2] = colour.in_space(space);
        return Math.sqrt(
            (a1 - a2) ** 2
            + (b1 - b2) ** 2
            + (c1 - c2) ** 2
        );
    }
}
