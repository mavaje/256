import {Folder} from "./folder";
import {Raster} from "../video/raster";
import {TextFile} from "./file-text";
import {PaletteFile} from "./file-palette";
import {ProgramFile} from "./file-program";
import {Color} from "../video/palette";
import {iInput} from "../../api/input";
import {RasterFile} from "./file-raster";
import {Font} from "../video/font";

export class FS extends Folder {

    static MASK = Color.PINK;

    static FOLDER: Raster;
    static FILE_PALETTE: Raster;
    static FILE_PROGRAM: Raster;
    static FILE_RASTER: Raster;
    static FILE_TEXT: Raster;

    static async load() {
        FS.FOLDER = await FS.load_icon('folder');
        FS.FILE_PALETTE = await FS.load_icon('file-palette');
        FS.FILE_PROGRAM = await FS.load_icon('file-program');
        FS.FILE_RASTER = await FS.load_icon('file-raster');
        FS.FILE_TEXT = await FS.load_icon('file-text');
    }

    static async load_icon(icon: string) {
        return Raster.from_file(`fs/${icon}`, FS.MASK);
    }

    constructor() {
        super();
        this.add_item(new Folder('DIR'));
        this.add_item(new TextFile('TXT'));
        this.add_item(new PaletteFile('PLT'));
        this.add_item(new ProgramFile('PRG'));
        this.add_item(new RasterFile('IMG'));
    }

    update(input: iInput) {
        input.cursor.position[1] -= 7;
        super.update(input);
    }

    render(raster: Raster) {
        const sub_raster = new Raster(256, 249, 0);
        super.render(sub_raster);
        raster.stamp(sub_raster, [0, 7]);
    }
}