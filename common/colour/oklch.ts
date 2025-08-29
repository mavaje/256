import {Colour, LAB, RGB} from "./colour";
import {OKLabColour} from "./oklab";

export class OKLchColour extends Colour {

    protected constructor(lch: ArrayLike<number>) {
        super();
        this.set_oklch(lch);
    }

    static from(lch: ArrayLike<number>) {
        return new OKLchColour(lch);
    }

    rgb(): RGB {
        if (!this._rgb) {
            const rgb = OKLabColour.from(this.oklab()).rgb();
            this.set_rgb(rgb);
        }

        return super.rgb();
    }

    oklab(): LAB {
        if (!this._oklab) {
            const [L, c, h] = this.oklch();
            const a = c * Math.cos(h);
            const b = c * Math.sin(h);

            this.set_oklab([L, a, b]);
        }

        return super.oklab();
    }
}
