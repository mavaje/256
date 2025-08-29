export type Triplet<F extends string = never> = [number, number, number] & {
    [K in F]: number;
};

export type RGB = Triplet<'r' | 'g' | 'b'>;
export type LAB = Triplet<'L' | 'a' | 'b'>;
export type LCH = Triplet<'L' | 'c' | 'h'>;

export type ColourSpace = 'rgb' | 'oklab' | 'oklch';

export abstract class Colour {
    protected _hex: string;
    protected _rgb: RGB;
    protected _oklab: LAB;
    protected _oklch: LCH;

    protected constructor() {}

    protected static byte_to_scalar(byte: number): number {
        return Math.max(0, Math.min(byte / 255, 1));
    }

    protected static scalar_to_byte(scalar: number): number {
        return Math.max(0, Math.min(Math.floor(scalar * 256), 255));
    }

    protected static to_linear(value: number) {
        return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    }

    protected static from_linear(value: number) {
        return value <= 0.0031308
            ? 12.92 * value
            : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    }

    protected set_rgb(rgb: ArrayLike<number>) {
        const {[0]: r, [1]: g, [2]: b} = rgb;
        this._rgb = Object.assign([r, g, b], {r, g, b}) as RGB;
    }

    protected set_oklab(lab: ArrayLike<number>) {
        const {[0]: L, [1]: a, [2]: b} = lab;
        this._oklab = Object.assign([L, a, b], {L, a, b}) as LAB;
    }

    protected set_oklch(lch: ArrayLike<number>) {
        const {[0]: L, [1]: c, [2]: h} = lch;
        this._oklch = Object.assign([L, c, h], {L, c, h}) as LCH;
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

    in_space(space: ColourSpace): Triplet {
        switch (space) {
            case 'rgb':
                return this.rgb();
            case 'oklab':
                return this.oklab();
            case 'oklch':
                return this.oklch();
        }
    }

    rgb(): RGB {
        if (!this._rgb) {
            throw new Error(`RGB not set by ${this.constructor.name}`);
        }

        return this._rgb;
    }

    rgb_bytes(): Triplet {
        return this.rgb().map(Colour.scalar_to_byte) as Triplet;
    }

    linear_rgb(): Triplet {
        return this.rgb().map(Colour.to_linear) as Triplet;
    }

    hex(): string {
        return this._hex ??= '#' + this.rgb_bytes()
            .map(v => v.toString(16))
            .map(x => x.padStart(2, '0'))
            .join('');
    }

    oklab(): LAB {
        if (!this._oklab) {
            throw new Error(`OKLab not set by ${this.constructor.name}`);
        }

        return this._oklab;
    }

    oklch(): LCH {
        if (!this._oklch) {
            throw new Error(`OKLch not set by ${this.constructor.name}`);
        }

        return this._oklch;
    }
}
