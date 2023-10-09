import {Wallpaper} from "./wallpaper";
import {Raster} from "../raster";
import {CONFIG} from "../../../config";

export class Image extends Wallpaper {

    static TEST: Image;

    constructor(private image: Raster) {
        super();
    }

    static async load() {
        Image.TEST = await Image.load_background('test');
        console.log(Image.TEST);
    }

    static async load_background(file: string) {
        const raster = await Raster.from_file(`backgrounds/${file}`);
        return new Image(raster);
    }

    update() {}

    render(raster: Raster) {
        raster.stamp(this.image, [0, 0], CONFIG.screen_x / this.image.width);
    }
}