type Triplet = [number, number, number];

export class Colour {
    private original_type: 'rgb';

    _hex: string;
    _rgb: Triplet;

    private constructor() {}

    static from_rgb(rgb: Triplet) {
        const colour = new Colour();
        colour.original_type = 'rgb';
        colour._rgb = rgb;
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

    hex(): string {
        return this._hex ??= '#' + this.rgb()
            .map(v => Math.round(255 * v))
            .map(v => v.toString(16))
            .map(x => x.padStart(2, '0'))
            .join('');
    }
}
