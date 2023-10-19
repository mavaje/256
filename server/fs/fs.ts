import {Folder} from "./folder";
import {Point, Raster} from "../video/raster";
import {TextFile} from "./file-text";
import {PaletteFile} from "./file-palette";
import {ProgramFile} from "./file-program";
import {Color, Palette} from "../video/palette";
import {iInput} from "../../api/input";
import {RasterFile} from "./file-raster";
import {CONFIG} from "../../config";
import {Cursor} from "../video/cursor";
import {Renderable} from "../video/renderable";
import {FolderContent} from "../video/window/window-folder";

export class FS implements Renderable {

    static FOLDER: Raster;
    static FOLDER_UP: Raster;
    static FILE_PALETTE: Raster;
    static FILE_PROGRAM: Raster;
    static FILE_RASTER: Raster;
    static FILE_TEXT: Raster;

    root: FolderContent;

    offset: Point = [0, 16];

    static async load() {
        FS.FOLDER = await FS.load_icon('folder');
        FS.FOLDER_UP = await FS.load_icon('folder-up');
        FS.FILE_PALETTE = await FS.load_icon('file-palette');
        FS.FILE_PROGRAM = await FS.load_icon('file-program');
        FS.FILE_RASTER = await FS.load_icon('file-raster');
        FS.FILE_TEXT = await FS.load_icon('file-text');
    }

    static async load_icon(icon: string, mask = Color.PINK) {
        return Raster.from_file(`fs/${icon}`, mask);
    }

    constructor() {
        const root = new Folder('ROOT');
        const folder = new Folder('DIR');
        root.add_item(folder);
        folder.add_item(new Folder('SUBDIR'));
        folder.add_item(new TextFile('ITEM', 'abc\na\nr3275927528709548209850825\n\nz'));

        root.add_item(new TextFile('TXT'));
        root.add_item(new PaletteFile('NEON', Palette.NEON));
        root.add_item(new ProgramFile('PRG'));
        root.add_item(new RasterFile('IMG', FS.FILE_PALETTE));

        this.root = new FolderContent(root);
    }

    update(input: iInput) {
        Cursor.shift(input, this.offset, () => this.root.update(input));
    }

    render(raster: Raster) {
        const sub_raster = new Raster(CONFIG.screen_x - this.offset[0], CONFIG.screen_y - this.offset[1], 0);
        this.root.render(sub_raster);
        raster.stamp(sub_raster, this.offset);
    }
}