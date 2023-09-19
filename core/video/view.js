"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
class View {
    cursor;
    cursor_pressed;
    handle_event(event) {
        switch (event.type) {
            case 'cursor-move':
                this.cursor = event.data.point;
                break;
            case 'cursor-press':
                this.cursor_pressed = true;
                break;
            case 'cursor-release':
                this.cursor_pressed = false;
                if (this.cursor)
                    this._buttons.forEach(({ point, width, height, on_press }) => {
                        if (point[0] <= this.cursor[0] && this.cursor[0] < point[0] + width &&
                            point[1] <= this.cursor[1] && this.cursor[1] < point[1] + height) {
                            on_press();
                        }
                    });
                break;
            case 'key-press':
                break;
            case 'key-release':
                break;
        }
        return false;
    }
    update() {
    }
    render(raster) {
    }
    _buttons = [];
    register_button(point, width, height, on_press) {
        this._buttons.push({ point, width, height, on_press });
    }
}
exports.View = View;
