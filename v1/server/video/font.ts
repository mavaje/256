import {Raster} from "./raster";
import {Color} from "./palette";

export class Font {

    static BG_COLOR = Color.BLACK;
    static FG_COLOR = Color.WHITE;

    static MONO: Font;
    static SANS: Font;

    unknown_glyph = new Raster(0, 0, 0);
    glyphs: Raster[] = [];

    constructor(public line_height: number) {}

    static async load() {
        Font.MONO = await Font.load_font('mono', 7);
        Font.SANS = await Font.load_font('sans', 7);
    }

    static async load_font(font_name: string, line_height: number): Promise<Font> {
        const font = new Font(line_height);

        let i: number;
        for (i = 0; i < 256; i++) {
            const file_name = i.toString(16).padStart(2, '0');
            font.glyphs[i] = (await Raster.from_file(`fonts/${font_name}/${file_name}`, Font.BG_COLOR))?.sub_raster([0, 0], undefined, line_height) ?? font.unknown_glyph;
            if (i === 0) font.unknown_glyph = font.glyphs[0];
        }

        return font;
    }
}