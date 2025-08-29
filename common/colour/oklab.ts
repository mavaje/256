import {Colour, LCH, RGB} from "./colour";

export class OKLabColour extends Colour {

    protected constructor(lab: ArrayLike<number>) {
        super();
        this.set_oklab(lab);
    }

    static from(lab: ArrayLike<number>) {
        return new OKLabColour(lab);
    }

    rgb(): RGB {
        if (!this._rgb) {
            const [L, a, b] = this.oklab();

            let l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
            let m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
            let s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;

            this.set_rgb([
                Colour.from_linear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
                Colour.from_linear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
                Colour.from_linear(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
            ]);
        }

        return super.rgb();
    }

    oklch(): LCH {
        if (!this._oklch) {
            const [L, a, b] = this.oklab();
            const c = Math.sqrt(a ** 2 + b ** 2);
            const h = Math.atan2(b, a);

            this.set_oklch([L, c, h]);
        }

        return super.oklch();
    }
}
