import {BLACK, ColourID, Palette, TRANSPARENT, WHITE} from "../../common/palette";
import {PNGFile} from "./png-file";
import {Sprite} from "../graphics/sprite";
import {Font, GlyphMap} from "../graphics/font";

export class FontFile extends PNGFile {
    static PATH = 'resources/fonts';

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
        file.create_sprite();
        file.palette = palette;
        return file.save();
    }

    static load(palette: Palette, name: string, path?: string, extension?: string): FontFile {
        return new FontFile(name, path, extension).load(palette);
    }

    create_sprite() {
        this.sprite = new Sprite(128, 160);
        this.sprite.fill(BLACK);

        for (let code = 0; code < 256; code++) {
            const x = 8 * (code % 16);
            const y = 10 * Math.floor(code / 16);
            const char = String.fromCharCode(code);

            this.sprite.fill_rect(x, y, 7, 9, TRANSPARENT,);
            this.sprite.print(char, x + 1, y + 1, {colour: WHITE});
        }
    }

    load(palette?: Palette) {
        super.load(palette);

        const glyphs: GlyphMap = {};

        const bg = this.sprite.get_pixel(0, 0);
        let border: ColourID;

        let height = 1;
        while (true) {
            const colour = this.sprite.get_pixel(0, height);
            if (colour === bg) {
                height++;
            } else {
                border = colour;
                break;
            }
        }

        let code: number;
        for (let row = 0; row < 16; row++) {
            code = row * 16;
            const y = row * (height + 1);
            let width = 0;
            for (let x = 0; x < this.sprite.width; x++) {
                if (this.sprite.get_pixel(x, y) === border) {
                    glyphs[code] = this.sprite.sub(x - width, y, width, height);
                    width = 0;
                    code++;
                } else {
                    width++;
                }
            }
        }

        this.font = new Font(height, glyphs);

        return this;
    }
}
