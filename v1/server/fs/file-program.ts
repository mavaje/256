import {File} from "./file";
import {FS} from "./fs";
import {Palette} from "../video/palette";

export class ProgramFile extends File {

    constructor(name?: string) {
        super(name);
        this.icon = FS.FILE_PROGRAM;
    }
}