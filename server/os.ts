import {Folder} from "./fs/folder";
import {Raster} from "./video/raster";
import {Window} from "./video/window";
import {Server} from "./server";
import {Cursor} from "./video/cursor";
import {Client} from "../client/client";
import {Wallpaper} from "./video/wallpaper/wallpaper";
import {SolidColour} from "./video/wallpaper/solid-colour";
import {iInput} from "../api/input";
import {Palette} from "./video/palette";
import {CONFIG} from "../config";
import {Font} from "./video/font";

export class OS {

    static instance: OS;

    server: Server;

    directory: Folder;

    cycle_id: any;
    last_frame: number = 0;

    palette: Palette = Palette.DEFAULT;
    raster: Raster;

    cursor: Cursor;

    wallpaper: Wallpaper = new SolidColour();
    windows: Window[];

    constructor() {
        OS.instance = this;

        this.server = new Server();
        this.server.register_client(new Client(0));

        this.directory = new Folder();
        this.raster = new Raster(CONFIG.screen_x, CONFIG.screen_y);
        this.windows = [];
        this.cursor = Cursor.HAND;
    }

    handle_input(input: iInput[]) {
        this.cursor.handle_input(input);
    }

    async start() {
        this.cycle_id = Math.random();
        this.cycle(this.cycle_id);

        this.raster.font = Font.MONO;
    }

    cycle(cycle_id: any) {
        requestAnimationFrame(t => {
            if (cycle_id !== this.cycle_id) return;
            if (t - this.last_frame > 1000 / CONFIG.fps) {
                this.last_frame = t;
                this.update();
                this.render();
            }
            this.cycle(cycle_id);
        });
    }

    update() {
        Raster.reset_all();

        this.wallpaper.update();
    }

    render() {
        this.raster.clear();

        this.wallpaper.render();
        this.raster.stamp(this.wallpaper.raster);

        const text = [...Array(256)].map((_, i) => String.fromCharCode(i) + (i % 16 === 15 ? '\n' : '')).join('');

        this.raster.font = Font.MONO;
        this.raster.print(text);
        this.raster.print('\n\n');
        this.raster.print('Hello world!');

        this.raster.cursor = [128, 0];

        this.raster.font = Font.SANS;
        this.raster.print(text);
        this.raster.print('\n\n');
        this.raster.print('Hello world!');

        this.windows.forEach(window =>
            this.raster.stamp(window.raster, window.position)
        );

        this.cursor.render(this.raster);

        const {palette, raster, cursor} = this;
        this.handle_input(this.server.send({palette, raster, cursor}));
    }
}