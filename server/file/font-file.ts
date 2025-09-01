import {
    ColourID,
    GREY,
    Palette,
    SILVER,
    WHITE,
} from "../../common/palette";
import {PNGFile} from "./png-file";
import {Sprite} from "../graphics/sprite";
import {Font, GlyphMap} from "../graphics/font";
import {Glyph} from "../graphics/glyph";

export class FontFile extends PNGFile {
    static PATH = 'resources/fonts';

    static GLYPH_CORNER: ColourID = WHITE;
    static GLYPH_OVERHANG: ColourID = SILVER;
    static GLYPH_EDGE: ColourID = GREY;

    font: Font;

    protected constructor(
        name: string,
        path: string = FontFile.PATH,
        extension?: string,
    ) {
        super(name, path, extension);
    }

    static save(font: Font, palette: Palette, name: string, path?: string, extension?: string): FontFile {
        const file = new FontFile(name, path, extension);
        file.font = font;
        file.palette = palette;
        return file.save();
    }

    static load(palette: Palette, name: string, path?: string, extension?: string): FontFile {
        return new FontFile(name, path, extension).load(palette);
    }

    save(
        name?: string,
        path?: string,
        extension?: string,
    ) {
        this.sprite = new Sprite(128, 160);

        for (let code = 0; code < 256; code++) {
            const x = 8 * (code % 16);
            const y = 10 * Math.floor(code / 16);
            const glyph = this.font.glyph(code);

            this.sprite.line(x, y, x + glyph.width, y, FontFile.GLYPH_EDGE);
            this.sprite.line(x, y, x, y + glyph.height, FontFile.GLYPH_EDGE);

            if (glyph.overhang_left > 0) {
                this.sprite.line(x + 1, y, x + glyph.overhang_left, y, FontFile.GLYPH_OVERHANG);
            }

            if (glyph.overhang_right > 0) {
                this.sprite.line(x + 1 + glyph.width - glyph.overhang_right, y, x + glyph.width, y, FontFile.GLYPH_OVERHANG);
            }

            if (glyph.overhang_top > 0) {
                this.sprite.line(x, y + 1, x, y + glyph.overhang_top, FontFile.GLYPH_OVERHANG);
            }

            if (glyph.overhang_bottom > 0) {
                this.sprite.line(x, y + 1 + glyph.height - glyph.overhang_bottom, x, y + glyph.height, FontFile.GLYPH_OVERHANG);
            }

            this.sprite.set_pixel(x, y, FontFile.GLYPH_CORNER);

            this.sprite.stamp(glyph, x + 1, y + 1);
        }

        return super.save(name, path, extension);
    }

    load(palette?: Palette) {
        super.load(palette);

        const glyphs: GlyphMap = {};

        let height = 0;
        let overhang_top = 0;
        let overhang_bottom = 0;

        measure:
        for (let y = 0; y < this.sprite.height; y++) {
            const colour = this.sprite.get_pixel(0, y);
            switch (colour) {
                case FontFile.GLYPH_OVERHANG:
                    if (height > 0) {
                        overhang_bottom++;
                    } else {
                        overhang_top++;
                    }
                    break;
                case FontFile.GLYPH_EDGE:
                    height++;
                    break;
                case FontFile.GLYPH_CORNER:
                    if (y > 0) break measure;
                    break;
                default:
                    throw new Error('Invalid font format!');
            }
        }

        const row_height = 1 + overhang_top + height + overhang_bottom;

        for (let row = 0; row < 16; row++) {
            const y = row * row_height;

            let x = 0;
            for (let column = 0; column < 16; column++) {
                let width = 0;
                let overhang_left = 0;
                let overhang_right = 0;

                row:
                for (let xx = x; xx < this.sprite.width; xx++) {
                    const colour = this.sprite.get_pixel(xx, y);
                    switch (colour) {
                        case FontFile.GLYPH_OVERHANG:
                            if (width > 0) {
                                overhang_left++;
                            } else {
                                overhang_right++;
                            }
                            break;
                        case FontFile.GLYPH_EDGE:
                            width++;
                            break;
                        case FontFile.GLYPH_CORNER:
                            if (xx > x) break row;
                            break;
                        default:
                            throw new Error('Invalid font format!');
                    }
                }

                const code = row * 16 + column;
                const column_width = 1 + overhang_left + width + overhang_right;

                glyphs[code] = Glyph.from(
                    this.sprite.sub(x + 1, y + 1, column_width - 1, row_height - 1),
                    overhang_top,
                    overhang_bottom,
                    overhang_left,
                    overhang_right,
                );

                x += column_width;
            }
        }

        this.font = new Font(height, glyphs);

        return this;
    }
}
