"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Draw = void 0;
const tab_1 = require("../tab");
const raster_1 = require("../../video/raster");
const palette_1 = require("../../video/palette");
class Draw extends tab_1.Tab {
    static WIDTH = 16;
    static HEIGHT = 16;
    static SCALE = 8;
    static OFFSET_X = 0;
    static OFFSET_Y = 64;
    icon = 10;
    raster = new raster_1.Raster(Draw.WIDTH, Draw.HEIGHT);
    gallery = [];
    constructor() {
        super();
        for (let i = 0; i < 16; i++) {
            this.register_button([128 + 32 * (i % 4), 64 + 32 * Math.floor(i / 4)], 32, 32, () => this._color = i);
        }
    }
    update() {
        super.update();
        this.cursor_color = this._color;
    }
    render(raster) {
        this.gallery.forEach((r, i) => raster.stamp(r, [Draw.WIDTH * i, 0]));
        raster.stamp(this.raster, [Draw.OFFSET_X, Draw.OFFSET_Y], Draw.SCALE);
        if (this._last) {
            raster.square(this.cursor.map(n => 8 * Math.floor(n / 8) - 1), 10, null, palette_1.Color.BLACK);
            raster.square(this.cursor.map(n => 8 * Math.floor(n / 8)), 8, null, palette_1.Color.WHITE);
        }
        for (let i = 0; i < 16; i++) {
            raster.square([128 + 32 * (i % 4), 64 + 32 * Math.floor(i / 4)], 32, i);
        }
        raster.square([127 + 32 * (this._color % 4), 63 + 32 * Math.floor(this._color / 4)], 34, null, this._color === 1 ? palette_1.Color.WHITE : palette_1.Color.BLACK);
        raster.square([128 + 32 * (this._color % 4), 64 + 32 * Math.floor(this._color / 4)], 32, null, this._color === 1 ? palette_1.Color.BLACK : palette_1.Color.WHITE);
    }
    _color = palette_1.Color.WHITE;
    _drawing = false;
    _last = null;
    handle_event(event) {
        if (super.handle_event(event))
            return true;
        switch (event.type) {
            case 'cursor-move':
                const point = this.transform(event.data.point);
                if (this._drawing && this._last) {
                    this.raster.line(this._last, point, this._color);
                }
                this._last = point;
                break;
            case 'cursor-press':
                this._drawing = true;
                break;
            case 'cursor-release':
                if (this._last)
                    this.raster.pixel(this._last, this._color);
                this._drawing = false;
                this.gallery.push(this.raster.clone());
                while (this.gallery.length * Draw.WIDTH > 256)
                    this.gallery.shift();
                break;
            case 'key-press':
                break;
            case 'key-release':
                break;
        }
        return false;
    }
    transform(point) {
        return [
            Math.floor((point[0] - Draw.OFFSET_X) / Draw.SCALE),
            Math.floor((point[1] - Draw.OFFSET_Y) / Draw.SCALE)
        ];
    }
}
exports.Draw = Draw;
