"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Palette = exports.Color = exports.rgb = void 0;
const time_1 = require("../util/time");
function rgb(hex) {
    hex = hex.replaceAll(/[^0-9a-f]/gi, '');
    let r = 0, g = 0, b = 0;
    switch (hex.length) {
        case 0:
            break;
        case 1:
            r = g = b = 17 * parseInt(hex, 16);
            break;
        case 2:
            r = g = b = parseInt(hex, 16);
            break;
        case 3:
        case 4:
        case 5:
            [r, g, b] = hex.split('').map(x => 17 * parseInt(x, 16));
            break;
        case 6:
        default:
            [r, g, b] = [...hex.matchAll(/../g)].map(x => parseInt(x[0], 16));
            break;
    }
    return new Color(...[r, g, b].map(x => Math.max(0, Math.min(Math.floor(x), 255))));
}
exports.rgb = rgb;
class Color extends Array {
    static BLACK = 0;
    static WHITE = 1;
    static GREY = 2;
    static SILVER = 3;
    static RED = 4;
    static BROWN = 5;
    static ORANGE = 6;
    static YELLOW = 7;
    static SAND = 8;
    static LIME = 9;
    static GREEN = 10;
    static CYAN = 11;
    static BLUE = 12;
    static NAVY = 13;
    static PURPLE = 14;
    static PINK = 15;
    get r() {
        return this[0] ?? 0;
    }
    get g() {
        return this[1] ?? 0;
    }
    get b() {
        return this[2] ?? 0;
    }
    get a() {
        return 255;
    }
}
exports.Color = Color;
class Palette {
    static DEFAULT;
    colors;
    static async ready() {
        return (0, time_1.sleep_until)(() => _ready);
    }
    constructor(colors = []) {
        this.colors = colors.slice(0, 16);
    }
    color(i) {
        return this.colors[i] ?? new Color();
    }
}
exports.Palette = Palette;
let _ready = false;
// @ts-ignore
Promise.resolve().then(() => __importStar(require(`./palettes/default.txt`))).then(({ default: text }) => {
    const colors = text.split('\n').map(rgb);
    Palette.DEFAULT = new Palette(colors);
})
    .catch(err => {
    console.log(err);
    Palette.DEFAULT = new Palette([
        rgb('#000000'),
        rgb('#ffffff'),
    ]);
})
    .then(() => _ready = true);
