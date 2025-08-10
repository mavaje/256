import {Raster} from "./video/raster";
import {Window} from "./video/window/window";
import {Server} from "./server";
import {Cursor} from "./video/cursor";
import {Client} from "../client/client";
import {Wallpaper} from "./video/wallpaper/wallpaper";
import {SolidColor} from "./video/wallpaper/solid-color";
import {iInput} from "../api/input";
import {Palette} from "./video/palette";
import {CONFIG} from "../config";
import {Toolbar} from "./video/toolbar";
import {Renderable} from "./video/renderable";
import {FS} from "./fs/fs";

export class OS {

    static instance: OS;

    server: Server;

    fs: FS;

    cycle_id: any;
    last_frame: number = 0;

    palette: Palette = Palette.NEON;
    raster: Raster;

    cursor: Cursor = Cursor.HAND;

    wallpaper: Wallpaper = new SolidColor();
    toolbar: Toolbar = new Toolbar();
    windows: Window[];

    input: iInput = {};

    static toggle_window(window: Window) {
        const os = OS.instance;
        if (os.windows.includes(window) && !window.minimised) {
            window.minimised = true;
        } else {
            OS.open_window(window);
        }
    }

    static open_window(window: Window) {
        OS.close_window(window);
        const os = OS.instance;
        os.windows.push(window);
        window.minimised = false;
    }

    static close_window(window: Window) {
        const os = OS.instance;
        const i = os.windows.indexOf(window);
        if (i >= 0) os.windows.splice(i, 1);
    }

    static windows() {
        const os = OS.instance;
        return os.windows;
    }

    constructor() {
        OS.instance = this;

        this.server = new Server();
        this.server.register_client(new Client(0));

        this.fs = new FS();
        this.raster = new Raster(CONFIG.screen_x, CONFIG.screen_y);
        this.windows = [];
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

    renderables(): Renderable[] {
        return [
            this.wallpaper,
            this.toolbar,
            this.fs,
            ...this.windows,
            this.cursor,
        ];
    }

    update() {
        Raster.reset_all();
        Cursor.cursor_ready(false);
        const renderables = this.renderables();
        renderables.reverse();
        renderables.forEach(renderable => {
            renderable.update(this.input);
        });
    }

    render() {
        const {palette, raster, cursor} = this;

        raster.clear();

        this.renderables().forEach(r => r.render(raster));

        this.server.send({palette, raster, cursor})
            .then(input => this.input = input);
    }
}