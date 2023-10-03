import {Wallpaper} from "./wallpaper";

export class Static extends Wallpaper {

    update() {}

    render() {
        let x: number, y: number;
        for (x = 0; x < 256; x++) for (y = 0; y < 256; y++) {
            const color = Math.floor(Math.random() * 16);
            this.raster.pixel([x, y], color);
        }
    }
}