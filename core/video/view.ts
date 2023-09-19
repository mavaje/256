import {Event} from "../control/event";
import {Point, Raster} from "./raster";

export class View {

    cursor: Point;
    cursor_pressed: boolean;

    handle_event(event: Event): boolean {
        switch (event.type) {
            case 'cursor-move':
                this.cursor = event.data.point;
                break;
            case 'cursor-press':
                this.cursor_pressed = true;
                break;
            case 'cursor-release':
                this.cursor_pressed = false;
                if (this.cursor) this._buttons.forEach(({point, width, height, on_press}) => {
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

    render(raster: Raster) {

    }

    private _buttons: {
        point: Point;
        width: number;
        height: number;
        on_press: () => void;
    }[] = [];
    register_button(point: Point, width: number, height: number, on_press: () => void) {
        this._buttons.push({point, width, height, on_press});
    }
}
