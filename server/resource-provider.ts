import {Sprite} from "../common/sprite";
import {PaletteFile} from "./file/palette-file";
import {SpriteFile} from "./file/sprite-file";
import {Palette} from "../common/palette";

export class ResourceProvider {

    static DEFAULT_RESOURCE_PATH = 'resources';

    resources: {
        palettes: {
            [name: string]: PaletteFile;
        };
        sprites: {
            [name: string]: SpriteFile;
        };
    } = {
        palettes: {},
        sprites: {},
    };

    default_palette = this.palette('neon');

    constructor(public resource_path: string = ResourceProvider.DEFAULT_RESOURCE_PATH) {}

    palette_file(name: string): PaletteFile {
        if (!(name in this.resources.palettes)) {
            let file = PaletteFile.load(name, `${this.resource_path}/palettes`);
            if (!file.exists()) file = PaletteFile.load(name, `${ResourceProvider.DEFAULT_RESOURCE_PATH}/palettes`);
            this.resources.palettes[name] = file;
        }

        return this.resources.palettes[name];
    }

    palette(name: string): Palette {
        return this.palette_file(name).palette;
    }

    sprite_file(name: string, palette: Palette = this.default_palette): SpriteFile {
        if (!(name in this.resources.sprites)) {
            let file = SpriteFile.load(palette, name, `${this.resource_path}/sprites`);
            if (!file.exists()) file = SpriteFile.load(palette, name, `${ResourceProvider.DEFAULT_RESOURCE_PATH}/sprites`);
            this.resources.sprites[name] = file;
        }

        return this.resources.sprites[name];
    }

    sprite(name: string): Sprite {
        return this.sprite_file(name).sprite;
    }
}
