"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const raster_1 = require("./video/raster");
const palette_1 = require("./video/palette");
const glyph_map_1 = require("./video/glyph_map");
const script_1 = require("./editor/script/script");
const draw_1 = require("./editor/draw/draw");
const view_1 = require("./video/view");
class Main extends view_1.View {
    static FRAME_RATE = 60;
    static MILLIS_PER_FRAME = 1000 / Main.FRAME_RATE;
    static TAB_WIDTH = 16;
    static TAB_HEIGHT = 16;
    static CURSOR_CHAR = glyph_map_1.GlyphMap.char('ARROW_UL');
    static CURSOR_COLOR = 1;
    raster;
    driver;
    controller;
    _tabs = [
        new script_1.Script(),
        new draw_1.Draw(),
    ];
    _tab = 0;
    _running = false;
    static async ready() {
        return Promise.all([
            palette_1.Palette.ready(),
            glyph_map_1.GlyphMap.ready()
        ]);
    }
    constructor(driver, controller) {
        super();
        this.raster = new raster_1.Raster();
        this.driver = driver;
        this.controller = controller;
        controller.initialise(this.handle_event.bind(this));
    }
    _last_frame = 0;
    cycle() {
        requestAnimationFrame(t => {
            if (!this._running)
                return;
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
        ], 256, Main.TAB_HEIGHT, palette_1.Color.YELLOW);
        this.raster.rect([
            0,
            256 - Main.TAB_HEIGHT
        ], 256, 1, palette_1.Color.ORANGE);
        this._tabs.forEach((tab, i) => {
            if (i === this._tab) {
                this.raster.rect([
                    Main.TAB_WIDTH * i,
                    256 - Main.TAB_HEIGHT
                ], Main.TAB_WIDTH, Main.TAB_HEIGHT, palette_1.Color.ORANGE);
                this.raster.print([tab.icon], [
                    Main.TAB_WIDTH * (i + 1 / 2) - 3,
                    256 - Main.TAB_HEIGHT / 2 - 4
                ], palette_1.Color.WHITE);
            }
            else {
                this.raster.print([tab.icon], [
                    Main.TAB_WIDTH * (i + 1 / 2) - 3,
                    256 - Main.TAB_HEIGHT / 2 - 4
                ], palette_1.Color.BROWN);
            }
        });
        const cursor = current_tab.cursor_char ?? Main.CURSOR_CHAR;
        const cursor_color = current_tab.cursor_color ?? Main.CURSOR_COLOR;
        if (this.cursor &&
            this.cursor[0] >= 0 && this.cursor[0] < 256 &&
            this.cursor[1] >= 0 && this.cursor[1] < 256) {
            let x, y;
            for (x = -1; x < 2; x++)
                for (y = -1; y < 2; y++) {
                    this.raster.print(cursor, [this.cursor[0] + x, this.cursor[1] + y], cursor_color == 0 ? 1 : 0);
                }
            this.raster.print(cursor, [this.cursor[0], this.cursor[1]], cursor_color);
        }
        this.driver.render(this.raster);
    }
    handle_event(event) {
        if (super.handle_event(event))
            return true;
        let handled = false;
        switch (event.type) {
            case 'cursor-move':
                this.cursor = event.data.point;
                break;
            case 'cursor-press':
                if (this.cursor[1] > 255 - Main.TAB_HEIGHT) {
                    const tab = Math.floor(this.cursor[0] / Main.TAB_WIDTH);
                    if (this._tabs[tab])
                        this._tab = tab;
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
exports.Main = Main;
