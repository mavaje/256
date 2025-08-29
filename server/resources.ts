import {Sprite} from "./graphics/sprite";
import {PaletteFile} from "./file/palette-file";
import {SpriteFile} from "./file/sprite-file";
import {Palette} from "../common/palette";
import {FontFile} from "./file/font-file";
import {Font} from "./graphics/font";

export class Resources {

    static DEFAULT_RESOURCE_PATH = 'resources';

    static DEFAULT_PALETTE_NAME = 'neon';
    static DEFAULT_FONT_NAME = 'mono';

    protected static project_resource_path: string = null;

    static resources: {
        palettes: {
            [name: string]: PaletteFile;
        };
        sprites: {
            [name: string]: SpriteFile;
        };
        fonts: {
            [name: string]: FontFile;
        };
    } = {
        palettes: {},
        sprites: {},
        fonts: {},
    };

    static palette_file(name: string = this.DEFAULT_PALETTE_NAME): PaletteFile {
        if (!(name in this.resources.palettes)) {
            const {PaletteFile} = require('./file/palette-file');

            let file: PaletteFile = null;

            if (this.project_resource_path) {
                file = PaletteFile.load(name, `${this.project_resource_path}/palettes`);
            }

            if (!file?.exists()) {
                file = PaletteFile.load(name, `${this.DEFAULT_RESOURCE_PATH}/palettes`);
            }

            this.resources.palettes[name] = file;
        }

        return this.resources.palettes[name];
    }

    static palette(name?: string): Palette {
        return this.palette_file(name).palette;
    }

    static sprite_file(name: string, palette_name?: string): SpriteFile {
        if (!(name in this.resources.sprites)) {
            const {SpriteFile} = require('./file/sprite-file');

            const palette = this.palette(palette_name);
            let file: SpriteFile = null;

            if (this.project_resource_path) {
                file = SpriteFile.load(palette, name, `${this.project_resource_path}/sprites`);
            }

            if (!file?.exists()) {
                file = SpriteFile.load(palette, name, `${this.DEFAULT_RESOURCE_PATH}/sprites`);
            }

            this.resources.sprites[name] = file;
        }

        return this.resources.sprites[name];
    }

    static sprite(name: string, palette_name?: string): Sprite {
        return this.sprite_file(name, palette_name).sprite;
    }

    static font_file(name: string = this.DEFAULT_FONT_NAME, palette_name?: string): FontFile {
        if (!(name in this.resources.fonts)) {
            const {FontFile} = require('./file/font-file');

            const palette = this.palette(palette_name);
            let file: FontFile = null;

            if (this.project_resource_path) {
                file = FontFile.load(palette, name, `${this.project_resource_path}/fonts`);
            }

            if (!file?.exists()) {
                file = FontFile.load(palette, name, `${this.DEFAULT_RESOURCE_PATH}/fonts`);
            }

            this.resources.fonts[name] = file;
        }

        return this.resources.fonts[name];
    }

    static font(name?: string, palette_name?: string): Font {
        return this.font_file(name, palette_name).font;
    }
}
