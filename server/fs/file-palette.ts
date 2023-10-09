import {File} from "./file";
import {FS} from "./fs";
import {Palette} from "../video/palette";

export class PaletteFile extends File {

    constructor(name?: string, private palette?: Palette) {
        super(name);
        this.icon = FS.FILE_PALETTE;
    }
}