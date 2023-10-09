import {File} from "./file";
import {FS} from "./fs";

export class TextFile extends File {

    constructor(name?: string, private content?: string) {
        super(name);
        this.icon = FS.FILE_TEXT;
    }
}