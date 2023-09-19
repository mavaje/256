import {Driver} from "./video/driver";
import {Point, Raster} from "./video/raster";
import {Color, Palette} from "./video/palette";
import {GlyphMap} from "./video/glyph_map";
import {Tab} from "./editor/tab";
import {Script} from "./editor/script/script";
import {Draw} from "./editor/draw/draw";
import {Event} from "./control/event";
import {Controller} from "./control/controller";
import {View} from "./video/view";

export class Main extends View {

    private static FRAME_RATE = 60;
    private static MILLIS_PER_FRAME = 1000 / Main.FRAME_RATE;

    private static TAB_WIDTH = 16;
    private static TAB_HEIGHT = 16;

    private static CURSOR_CHAR = GlyphMap.char('ARROW_UL');
    private static CURSOR_COLOR = 1;

    raster: Raster;
    driver: Driver;
    controller: Controller;

    private _tabs: Tab[] = [
        new Script(),
        new Draw(),
    ];

    private _tab = 0;

    private _running = false;

    static async ready(): Promise<any> {
        return Promise.all([
            Palette.ready(),
            GlyphMap.ready()
        ]);
    }

    constructor(driver: Driver, controller: Controller) {
        super();
        this.raster = new Raster();
        this.driver = driver;
        this.controller = controller;
        controller.initialise(this.handle_event.bind(this));
    }

    private _last_frame = 0;
    private cycle() {
        requestAnimationFrame(t => {
            if (!this._running) return;
            if (t - this._last_frame > Main.MILLIS_PER_FRAME) {
                this._last_frame = t;
                this.update();
            }
            this.render();
            this.cycle();
        });
    }

    update() {
        const current_tab = this._tabs[this._tab];
        current_tab.update();
    }

    render() {
        this.raster.clear();

        const current_tab = this._tabs[this._tab];
        current_tab.render(this.raster);
        this.raster.rect([
                0,
                256 - Main.TAB_HEIGHT
            ],
            256,
            Main.TAB_HEIGHT,
            Color.YELLOW);
        this.raster.rect([
                0,
                256 - Main.TAB_HEIGHT
            ],
            256,
            1,
            Color.ORANGE);
        this._tabs.forEach((tab, i) => {
            if (i === this._tab) {
                this.raster.rect([
                        Main.TAB_WIDTH * i,
                        256 - Main.TAB_HEIGHT
                    ],
                    Main.TAB_WIDTH,
                    Main.TAB_HEIGHT,
                    Color.ORANGE);
                this.raster.print(
                    [tab.icon],
                    [
                        Main.TAB_WIDTH * (i + 1/2) - 3,
                        256 - Main.TAB_HEIGHT / 2 - 4
                    ],
                    Color.WHITE);
            } else {
                this.raster.print(
                    [tab.icon],
                    [
                        Main.TAB_WIDTH * (i + 1/2) - 3,
                        256 - Main.TAB_HEIGHT / 2 - 4
                    ],
                    Color.BROWN);
            }
        });

        const cursor = current_tab.cursor_char ?? Main.CURSOR_CHAR;
        const cursor_color = current_tab.cursor_color ?? Main.CURSOR_COLOR;
        if (this.cursor &&
            this.cursor[0] >= 0 && this.cursor[0] < 256 &&
            this.cursor[1] >= 0 && this.cursor[1] < 256
        ) {
            let x, y;
            for (x = -1; x < 2; x++) for (y = -1; y < 2; y++) {
                this.raster.print(cursor, [this.cursor[0] + x, this.cursor[1] + y], cursor_color == 0 ? 1 : 0);
            }
            this.raster.print(cursor, [this.cursor[0], this.cursor[1]], cursor_color);
        }

        this.driver.render(this.raster);
    }

    handle_event(event: Event) {
        if (super.handle_event(event)) return true;
        let handled = false;
        switch (event.type) {
            case 'cursor-move':
                this.cursor = event.data.point;
                break;
            case 'cursor-press':
                if (this.cursor[1] > 255 - Main.TAB_HEIGHT) {
                    const tab = Math.floor(this.cursor[0] / Main.TAB_WIDTH);
                    if (this._tabs[tab]) this._tab = tab;
                    handled = true;
                }
                break;
            case 'cursor-release':
                break;
            case 'key-press':
                break;
            case 'key-release':
                break;
        }
        if (!handled) {
            this._tabs[this._tab]?.handle_event(event);
        }
        return false;
    }

    start() {
        this._running = true;
        this.cycle();
    }

    stop() {
        this._running = false;
    }
}
