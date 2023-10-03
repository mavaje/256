import {iClient} from "../api/client";
import {Palette} from "../server/video/palette";
import {iRaster} from "../api/raster";
import {iOutput} from "../api/output";
import {iCursor} from "../api/cursor";
import {Input} from "./input";

export class Client implements iClient {

    scale = 1;

    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    context = this.canvas.getContext('2d');

    palette: Palette = Palette.DEFAULT;
    raster: iRaster;

    input: Input;

    cursor: iCursor;

    constructor(private player: number = 0,) {
        this.input = new Input(this.player);
        this.start_listeners();
    }

    start_listeners() {
        window.addEventListener('resize', this.handle_resize.bind(this));
        this.handle_resize();

        document.addEventListener('mousemove', ({x, y}) => {
            const offset = this.canvas.getBoundingClientRect();
            this.input.cursor.position[0] = (x - offset.x) / this.scale;
            this.input.cursor.position[1] = (y - offset.y) / this.scale;
        })
    }

    handle_resize() {
        const container = this.canvas.parentElement;
        const {innerWidth, innerHeight} = window;
        this.scale = Math.floor(Math.min(innerWidth, innerHeight) / 256);
        this.scale = Math.max(this.scale, 1);
        container.style.setProperty('--scale', String(this.scale));
    }

    receive(output: iOutput) {
        this.palette = output.palette;
        this.raster = output.raster;
        this.input.cursor = output.cursor;

        const image_data = this.context.createImageData(256, 256);

        this.raster.pixels.flat().forEach((c, i) => {
            const color = this.palette[c] ?? [];
            image_data.data[i * 4]     = color[0] ?? 0;
            image_data.data[i * 4 + 1] = color[1] ?? 0;
            image_data.data[i * 4 + 2] = color[2] ?? 0;
            image_data.data[i * 4 + 3] = 255;
        });

        this.context.putImageData(image_data, 0, 0);

        return this.input;
    }
}