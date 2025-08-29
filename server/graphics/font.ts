import {Sprite} from "./sprite";

export type GlyphMap = {
    [code: number]: Sprite;
};

export class Font {

    constructor(
        public height: number,
        protected glyphs: GlyphMap,
    ) {}

    glyph(code: number): Sprite {
        return this.glyphs[code];
    }
}
