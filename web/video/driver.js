"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebDriver = void 0;
const palette_1 = require("../../core/video/palette");
class WebDriver {
    context;
    constructor(canvas) {
        canvas.width = 256;
        canvas.height = 256;
        this.context = canvas.getContext('2d');
    }
    render(raster, palette = palette_1.Palette.DEFAULT) {
        const image_data = this.context.createImageData(256, 256);
        raster.data.flat(1).forEach((c, i) => {
            const color = palette.color(c);
            image_data.data[i * 4] = color.r;
            image_data.data[i * 4 + 1] = color.g;
            image_data.data[i * 4 + 2] = color.b;
            image_data.data[i * 4 + 3] = color.a;
        });
        this.context.putImageData(image_data, 0, 0);
    }
}
exports.WebDriver = WebDriver;
