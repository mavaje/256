import {Folder} from "./folder";
import {Raster} from "../video/raster";
import {TextFile} from "./file-text";
import {PaletteFile} from "./file-palette";
import {ProgramFile} from "./file-program";
import {iInput} from "../../api/input";

export class FS extends Folder {

    static FOLDER: Raster;
    static FILE_TEXT: Raster;
    static FILE_PALETTE: Raster;
    static FILE_PROGRAM: Raster;

    static async load() {
        FS.FOLDER = await FS.load_icon('folder');
        FS.FILE_TEXT = await FS.load_icon('file-text');
        FS.FILE_PALETTE = await FS.load_icon('file-palette');
        FS.FILE_PROGRAM = await FS.load_icon('file-program');
    }

    static async load_icon(icon: string) {
        return Raster.from_file(`fs/${icon}`, 0);
    }

    constructor() {
        super();
        this.add_item(new Folder('FOLDER'));
        this.add_item(new TextFile('TXT'));
        this.add_item(new PaletteFile('PLT'));
        this.add_item(new ProgramFile('PRG'));
    }

    render(raster: Raster) {
        const sub_raster = new Raster(256, 249, 0);
        super.render(sub_raster);
        raster.stamp(sub_raster, [0, 7]);
    }
}