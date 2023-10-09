import {iCursor} from "../api/input";

export class Cursor implements iCursor {

    position: [number, number] = [0, 0];
    pressed: boolean = false;

    scale: number = 1;
    offset: [number, number] = [0, 0];

    start_listeners() {
        document.addEventListener('mousemove', this.cursor_move.bind(this));
        document.addEventListener('pointerdown', this.set_state.bind(this, true));
        document.addEventListener('pointerup', this.set_state.bind(this, false));
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
        ];
    }

    set_state(state: boolean, event: MouseEvent) {
        event.preventDefault();
        this.cursor_move(event);
        this.pressed = state;
    }
}