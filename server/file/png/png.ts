import {File} from '../file';
import {Palette} from "../../../common/palette";
import {readFileSync, writeFileSync} from "fs";
import {Colour} from "../../../common/colour";
import {Sprite} from "../../../common/sprite";
import {Chunk} from "./chunk/chunk";
import {Header} from "./chunk/header";
import {Palette as PaletteChunk} from "./chunk/palette";
import {End} from "./chunk/end";
import {Data} from "./chunk/data";

export class PNG extends File {
    private static SIGNATURE = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    ]);

    static EXTENSION = 'png';

    public image: Sprite;
    public palette: Palette;

    protected constructor(
        name: string,
        path: string,
        extension: string = PNG.EXTENSION,
    ) {
        super(name, path, extension);
    }

    save(
        name: string = this.name,
        path: string = this.path,
        extension: string = this.extension,
    ) {
        const chunks: Chunk[] = [];

        chunks.push(new Header(this.image.width, this.image.height, {
            bit_depth: 4,
            colour_type: 3,
        }));

        chunks.push(new PaletteChunk(this.palette.colours));

        chunks.push(new Data(this.image));

        chunks.push(new End());

        let length = PNG.SIGNATURE.length;
        chunks.forEach(chunk => length += chunk.array.length);

        const data = new Uint8Array(length);
        data.set(PNG.SIGNATURE);
        let offset = PNG.SIGNATURE.length;

        chunks.forEach(chunk => {
            data.set(chunk.array, offset);
            offset += chunk.array.length;
        });

        const filename = this.filename(name, path, extension);
        writeFileSync(filename, data);

        return this;
    }

    load() {
        // todo change
        const content = readFileSync(this.filename(), 'utf-8');
        this.palette = new Palette(content
            .split('\n')
            .filter(Boolean)
            .map(Colour.from_hex));

        return this;
    }
}
