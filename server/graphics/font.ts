import {Glyph} from "./glyph";

export type GlyphMap = {
    [code: number]: Glyph;
};

export class Font {

    constructor(
        public height: number,
        protected glyphs: GlyphMap = {},
    ) {}

    set_glyph(code: number, glyph: Glyph) {
        this.glyphs[code] = glyph;
    }

    glyph(code: number): Glyph {
        return this.glyphs[code];
    }
}
