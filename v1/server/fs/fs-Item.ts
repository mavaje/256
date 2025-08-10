import {Raster} from "../video/raster";
import {Folder} from "./folder";

export abstract class FSItem {

    name: string;
    icon: Raster;

    parent?: Folder;

    constructor(name: string = '') {
        this.name = name;
    }

    launch() {
        console.log(`launching ${this.name} not supported`);
    }
}