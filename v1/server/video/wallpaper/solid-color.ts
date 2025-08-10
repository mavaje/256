import {Wallpaper} from "./wallpaper";
import {Raster} from "../raster";

export class SolidColor extends Wallpaper {

    constructor(private color: number = 0) {
        super();
    }

    update() {}

    render(raster: Raster) {
        raster.fill(this.color)
    }
}