import {Raster} from "./raster";

export class Font {

    static NEWLINE = 0x0A;

    static MONO: Font;
    static SANS: Font;

    unknown_glyph = new Raster(0, 0, 0);
    glyphs: Raster[] = [];

    constructor(public line_height: number) {}

    static async load_fonts() {
        Font.MONO = await Font.load('mono', 7);
        Font.SANS = await Font.load('sans', 7);
    }

    static async load(font_name: string, line_height: number): Promise<Font> {
        const font = new Font(line_height);

        let i: number;
        for (i = 0; i < 256; i++) {
            const file_name = i.toString(16).padStart(2, '0');
            font.glyphs[i] = await Raster.from_file(`fonts/${font_name}/${file_name}`, null, line_height, 0) ?? font.unknown_glyph;
            if (i === 0) font.unknown_glyph = font.glyphs[0];
        }

        return font;
    }
}