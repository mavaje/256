"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebController = void 0;
class WebController {
    element;
    constructor(element) {
        this.element = element;
    }
    initialise(handle) {
        const rect = this.element.getBoundingClientRect();
        const mouse_event = (type, x, y) => ({
            type,
            data: {
                point: [
                    Math.round((x - rect.x) * 256 / rect.width),
                    Math.round((y - rect.y) * 256 / rect.height),
                ]
            }
        });
        const key_event = (type, key) => ({
            type,
            data: {
                key: this.key_map(key)
            }
        });
        this.element.addEventListener('mousedown', ({ x, y }) => handle(mouse_event('cursor-press', x, y)));
        document.addEventListener('mouseup', ({ x, y }) => handle(mouse_event('cursor-release', x, y)));
        document.addEventListener('mousemove', ({ x, y }) => handle(mouse_event('cursor-move', x, y)));
        document.addEventListener('keydown', ({ key }) => handle(key_event('key-press', key)));
        document.addEventListener('keyup', ({ key }) => handle(key_event('key-release', key)));
    }
    key_map(key) {
        return {
            '0': 0,
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            'A': 10,
            'B': 11,
            'C': 12,
            ' ': 127,
            'Enter': 255,
        }[key] ?? null;
    }
}
exports.WebController = WebController;
