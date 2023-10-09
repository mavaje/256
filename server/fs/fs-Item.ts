import {Raster} from "../video/raster";

export abstract class FSItem {

    name: string;
    icon: Raster;

    constructor(name: string = '') {
        this.name = name;
    }

    render_icon(raster: Raster) {
        raster.contain(this.icon);
    }
}