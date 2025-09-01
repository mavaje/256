import {Sprite} from "./sprite";

export class Glyph extends Sprite {

    constructor(
        width: number,
        height: number,
        public overhang_top: number = 0,
        public overhang_bottom: number = 0,
        public overhang_left: number = 0,
        public overhang_right: number = 0,
    ) {
        super(width, height);
    }

    static from(
        sprite: Sprite,
        overhang_top: number = 0,
        overhang_bottom: number = 0,
        overhang_left: number = 0,
        overhang_right: number = 0,
    ): Glyph {
        const glyph = new Glyph(
            sprite.width,
            sprite.height,
            overhang_top,
            overhang_bottom,
            overhang_left,
            overhang_right,
        );

        glyph.stamp(sprite);

        return glyph;
    }

    inner_width() {
        return this.width - this.overhang_left - this.overhang_right;
    }

    inner_height() {
        return this.height - this.overhang_top - this.overhang_bottom;
    }
}
