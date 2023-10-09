import {Raster} from "./video/raster";
import {Window} from "./video/window";
import {Server} from "./server";
import {Cursor} from "./video/cursor";
import {Client} from "../client/client";
import {Wallpaper} from "./video/wallpaper/wallpaper";
import {SolidColor} from "./video/wallpaper/solid-color";
import {iInput} from "../api/input";
import {Color, Palette} from "./video/palette";
import {CONFIG} from "../config";
import {Galaxy} from "./video/wallpaper/galaxy";
import {Toolbar} from "./video/toolbar";
import {Renderable} from "./video/renderable";
import {Image} from "./video/wallpaper/image";
import {Static} from "./video/wallpaper/static";
import {FS} from "./fs/fs";

export class OS {

    static instance: OS;

    server: Server;

    fs: FS;

    cycle_id: any;
    last_frame: number = 0;

    palette: Palette = Palette.NEON;
    raster: Raster;

    cursor: Cursor;

    wallpaper: Wallpaper = new SolidColor();
    toolbar: Toolbar = new Toolbar();
    windows: Window[];

    input: iInput;

    constructor() {
        OS.instance = this;

        this.server = new Server();
        this.server.register_client(new Client(0));

        this.fs = new FS();
        this.raster = new Raster(CONFIG.screen_x, CONFIG.screen_y);
        this.windows = [];
        this.cursor = Cursor.POINTER;
    }

    async start() {
        this.cycle_id = Math.random();
        this.cycle(this.cycle_id);
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
        this.toolbar.update();
        if (this.input) {
            this.cursor.update(this.input);
            this.fs.update(this.input);
        }
    }

    render() {
        const {palette, raster, cursor} = this;

        raster.clear();

        ([
            this.wallpaper,
            this.toolbar,
            this.fs,
            ...this.windows,
            this.cursor,
        ] as Renderable[]).forEach(r => r.render(raster));

        this.server.send({palette, raster, cursor})
            .then(input => this.input = input);
    }
}