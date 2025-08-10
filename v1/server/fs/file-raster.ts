import {File} from "./file";
import {FS} from "./fs";
import {Color} from "../video/palette";
import {Raster} from "../video/raster";

export class RasterFile extends File {

    constructor(name?: string, private raster?: Raster) {
        super(name);
        this.icon = FS.FILE_RASTER.clone();
        this.update_raster(raster);
    }

    update_raster(raster: Raster) {
        this.raster = raster;
        if (raster) {
            const frame = new Raster(8, 8, raster.mask);
            frame.contain(raster);
            this.icon.stamp(frame, [2, 2]);
        }
    }
}