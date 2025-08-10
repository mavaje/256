import {Wallpaper} from "./wallpaper";
import {Raster} from "../raster";
import {CONFIG} from "../../../config";

export class Static extends Wallpaper {

    update() {}

    render(raster: Raster) {
        let x: number, y: number;
        for (x = 0; x < CONFIG.screen_x; x++) for (y = 0; y < CONFIG.screen_y; y++) {
            const color = Math.floor(Math.random() * 16);
            raster.pixel([x, y], color);
        }
    }
}