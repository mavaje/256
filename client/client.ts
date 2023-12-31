import {iClient} from "../api/client";
import {iRaster} from "../api/raster";
import {iOutput} from "../api/output";
import {CONFIG} from "../config";
import {Palette} from "../server/video/palette";
import {Cursor} from "./cursor";
import {iInput} from "../api/input";
import {KeyboardInput} from "./keyboard";
import {PlayerKeyboardInput} from "./player-keyboard";

export class Client implements iClient {

    scale = 1;
    offset: [number, number];

    cursor = new Cursor();
    keyboard = new KeyboardInput();
    players: {
        [id: number]: PlayerKeyboardInput
    } = {};

    input: iInput = {
        cursor: this.cursor,
        keyboard: this.keyboard,
        players: this.players,
    };

    pixel_filter: OffscreenCanvas;

    pixels_canvas = new OffscreenCanvas(CONFIG.screen_x + 2, CONFIG.screen_y + 2);
    pixels_context = this.pixels_canvas.getContext('2d', {willReadFrequently: true,});

    display_canvas: OffscreenCanvas;
    display_context: OffscreenCanvasRenderingContext2D;

    screen_canvas = document.getElementById('canvas') as HTMLCanvasElement;
    screen_context: CanvasRenderingContext2D;

    palette: Palette = Palette.NEON;
    raster: iRaster;

    constructor(private player: number = 0,) {
        this.start_listeners();
    }

    start_listeners() {
        this.cursor.start_listeners();
        this.keyboard.start_listeners();

        window.addEventListener('resize', this.handle_resize.bind(this));
        this.handle_resize();
    }

    handle_resize() {
        const screen_width = innerWidth * devicePixelRatio;
        const screen_height= innerHeight * devicePixelRatio;
        let s = Math.floor(Math.min(screen_width / CONFIG.screen_x, screen_height / CONFIG.screen_y));
        s = Math.max(s, 1);
        this.scale = s;
        this.offset = [
            (screen_width - CONFIG.screen_x * s) / 2,
            (screen_height - CONFIG.screen_y * s) / 2,
        ];
        this.cursor.reconfigure(this.scale, this.offset);

        this.display_canvas = new OffscreenCanvas((CONFIG.screen_x + 2) * s, (CONFIG.screen_y + 2) * s);
        this.display_context = this.display_canvas.getContext('2d');

        this.screen_canvas.width = (CONFIG.screen_x + 2) * s;
        this.screen_canvas.height = (CONFIG.screen_y + 2) * s;
        this.screen_canvas.style.width = `${this.screen_canvas.width / devicePixelRatio}px`;
        this.screen_canvas.style.height = `${this.screen_canvas.height / devicePixelRatio}px`;
        this.screen_context = this.screen_canvas.getContext('2d');

        if (CONFIG.crt) this.update_pixel_filter();
    }

    update_pixel_filter() {
        const s = this.scale;
        this.pixel_filter = new OffscreenCanvas(s, s);
        const pixel_ctx = this.pixel_filter.getContext('2d');

        const rgb = pixel_ctx.createLinearGradient(0, 0, s, 0);
        ['#ff0000', '#00ff00', '#0000ff'].forEach((c, i) => {
            rgb.addColorStop(i/3, '#000000');
            rgb.addColorStop(i/3 + 1/9, c);
            rgb.addColorStop(i/3 + 2/9, c);
        });
        rgb.addColorStop(1, '#000000');
        pixel_ctx.fillStyle = rgb;
        pixel_ctx.fillRect(0, 0, s, s);

        const stripe = pixel_ctx.createLinearGradient(0, 0, 0, s);
        stripe.addColorStop(0, '#000000');
        stripe.addColorStop(1/3, '#ffffff');
        stripe.addColorStop(2/3, '#ffffff');
        stripe.addColorStop(1, '#000000');
        pixel_ctx.fillStyle = stripe;
        pixel_ctx.globalCompositeOperation = 'multiply';
        pixel_ctx.fillRect(0, 0, s, s);
    }

    async receive(output: iOutput) {
        this.palette = new Palette(...output.palette);
        this.raster = output.raster;

        const image_data = this.pixels_context.getImageData(1, 1, CONFIG.screen_x, CONFIG.screen_y);

        this.raster.pixels.forEach((row, y) => row.forEach((c, x) => {
            const color = this.palette[c];
            [0, 1, 2].forEach(c => {
                image_data.data[(y * CONFIG.screen_x + x) * 4 + c] = color?.[c] ?? 0;
            });
            image_data.data[(y * CONFIG.screen_x + x) * 4 + 3] = 255;
        }));

        this.pixels_context.putImageData(image_data, 1, 1);

        const s = this.scale;

        this.display_context.save();

        this.display_context.fillStyle = '#000000';
        this.display_context.fillRect(0, 0, this.display_canvas.width, this.display_canvas.height);

        if (CONFIG.crt) {
            this.display_context.filter = `blur(${s / devicePixelRatio / 4}px)`;
        } else {
            this.display_context.imageSmoothingEnabled = false;
        }

        this.display_context.drawImage(this.pixels_canvas, 0, 0, this.display_canvas.width, this.display_canvas.height);

        if (CONFIG.crt) {
            this.display_context.globalCompositeOperation = 'color-dodge';
            this.display_context.fillStyle = this.display_context.createPattern(this.pixel_filter, 'repeat');
            this.display_context.fillRect(0, 0, this.display_canvas.width, this.display_canvas.height);
        }

        this.display_context.restore();

        this.screen_context.save();

        // if (CONFIG.crt) {
        //     this.screen_context.globalCompositeOperation = 'darken';
        //     this.screen_context.fillStyle = '#0000007f';
        //     this.screen_context.fillRect(0, 0, this.screen_canvas.width, this.screen_canvas.height);
        //     this.screen_context.globalCompositeOperation = 'lighten';
        // }

        this.screen_context.drawImage(this.display_canvas, 0, 0, this.display_canvas.width, this.display_canvas.height);

        this.screen_context.restore();

        const input = JSON.parse(JSON.stringify(this.input)) as iInput;
        this.cursor.reset_persist();
        this.keyboard.reset_persist();
        Object.values(this.players).forEach(player => player.reset_persist());
        return input;
    }
}