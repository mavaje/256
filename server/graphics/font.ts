import {Glyph} from "./glyph";

export class Font {

    constructor(
        public glyphs: {
            [code: number]: Glyph;
        },
    ) {

    }
}
