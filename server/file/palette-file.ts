import {ColourID, Palette} from "../../common/palette";
import {PNGFile} from "./png-file";
import {Sprite} from "../graphics/sprite";

export class PaletteFile extends PNGFile {
    static PATH = 'resources/palettes';

    protected constructor(
        name: string,
        path: string = PaletteFile.PATH,
        extension?: string,
    ) {
        super(name, path, extension);
        this.sprite = new Sprite(16, 16);
        for (let i = 0; i < 16; i++) {
            const x = 4 * (i % 4);
            const y = 4 * Math.floor(i / 4);
            this.sprite.fill_rect(x, y, x + 3, y + 3, i as ColourID);
        }
    }

    static save(palette: Palette, name: string, path?: string, extension?: string): PaletteFile {
        const file = new PaletteFile(name, path, extension);
        file.palette = palette;
        return file.save();
    }

    static load(name: string, path?: string, extension?: string): PaletteFile {
        return new PaletteFile(name, path, extension).load();
    }
}
