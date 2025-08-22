import {Palette} from "../../common/palette";
import {PNGFile} from "./png-file";
import {Sprite} from "../graphics/sprite";

export class SpriteFile extends PNGFile {
    static PATH = 'resources/sprites';

    protected constructor(
        name: string,
        path: string = SpriteFile.PATH,
        extension?: string,
    ) {
        super(name, path, extension);
    }

    static save(sprite: Sprite, palette: Palette, name: string, path?: string, extension?: string): SpriteFile {
        const file = new SpriteFile(name, path, extension);
        file.sprite = sprite;
        file.palette = palette;
        return file.save();
    }

    static load(palette: Palette, name: string, path?: string, extension?: string): SpriteFile {
        return new SpriteFile(name, path, extension).load(palette);
    }
}
