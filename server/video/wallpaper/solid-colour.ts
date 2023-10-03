import {Wallpaper} from "./wallpaper";

export class SolidColour extends Wallpaper {

    constructor(private color: number = 0) {
        super();
    }

    update() {}

    render() {
        this.raster.fill(this.color)
    }
}