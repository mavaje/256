import {Colour, LAB, LCH} from "./colour";
import {OKLabColour} from "./oklab";

export class RGBColour extends Colour {

    protected constructor(rgb: ArrayLike<number>) {
        super();
        this.set_rgb(rgb);
    }

    static from(rgb: ArrayLike<number>) {
        return new RGBColour(rgb);
    }

    static from_bytes(rgb: ArrayLike<number>) {
        return new RGBColour([
            Colour.byte_to_scalar(rgb[0]),
            Colour.byte_to_scalar(rgb[1]),
            Colour.byte_to_scalar(rgb[2]),
        ]);
    }

    static from_hex(hex: string) {
        hex = hex.replace(/[^\da-f]/gi, '');
        return RGBColour.from_bytes(
            [0, 1, 2]
            .map(i => hex.length < 6
                ? hex[i].repeat(2)
                : hex.slice(2 * i, 2 * (i + 1))
            )
            .map(x => Number.parseInt(x, 16) || 0)
        );
    }

    oklab(): LAB {
        if (!this._oklab) {
            let [r, g, b] = this.linear_rgb();

            const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
            const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
            const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

            this.set_oklab([
                0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
                1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
                0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
            ]);
        }

        return super.oklab();
    }

    oklch(): LCH {
        if (!this._oklch) {
            const lch = OKLabColour.from(this.oklab()).oklch();
            this.set_oklch(lch);
        }

        return super.oklch();
    }
}
