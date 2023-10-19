import {iCursor} from "../api/input";
import {Point} from "../server/video/raster";

export class Cursor implements iCursor {

    position: [number, number] = [0, 0];
    state: boolean = false;
    pressed: boolean = false;
    persist: boolean = false;

    scale: number = 1;
    offset: [number, number] = [0, 0];

    start_listeners() {
        document.addEventListener('mousemove', this.cursor_move.bind(this));

        document.addEventListener('pointerdown', this.set_state.bind(this, true));
        document.addEventListener('pointerup', this.set_state.bind(this, false));

        document.addEventListener('contextmenu', event => event.preventDefault());
    }

    reconfigure(scale: number, offset: [number, number]) {
        this.scale = scale;
        this.offset = offset;
    }

    cursor_move({x, y}: MouseEvent) {
        const s = this.scale;
        const [ox, oy] = this.offset;
        this.position = [
            (x * devicePixelRatio - ox) / s,
            (y * devicePixelRatio - oy) / s,
        ].map(Math.floor) as Point;
    }

    set_state(state: boolean, event: MouseEvent) {
        this.cursor_move(event);
        this.state = state;
        this.pressed = state || this.persist;
        if (state) this.persist = true;
    }

    reset_persist() {
        this.persist = false;
        this.pressed = this.state;
    }
}