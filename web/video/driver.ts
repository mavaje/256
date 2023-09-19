import {Driver} from "../../core/video/driver";
import {Palette} from "../../core/video/palette";
import {Raster} from "../../core/video/raster";

export class WebDriver implements Driver {

    context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        canvas.width = 256;
        canvas.height = 256;
        this.context = canvas.getContext('2d');
    }

    render(raster: Raster, palette: Palette = Palette.DEFAULT) {
        const image_data = this.context.createImageData(256, 256);

        raster.data.flat(1).forEach((c, i) => {
            const color = palette.color(c);
            image_data.data[i * 4]     = color.r;
            image_data.data[i * 4 + 1] = color.g;
            image_data.data[i * 4 + 2] = color.b;
            image_data.data[i * 4 + 3] = color.a;
        });

        this.context.putImageData(image_data, 0, 0);
    }
}
