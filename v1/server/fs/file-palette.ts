import {File} from "./file";
import {FS} from "./fs";
import {Palette} from "../video/palette";
import {PaletteWindow} from "../video/window/window-palette";

export class PaletteFile extends File {

    constructor(name?: string, public palette?: Palette) {
        super(name);
        this.icon = FS.FILE_PALETTE;
    }

    launch() {
        PaletteWindow.open(this);
    }
}