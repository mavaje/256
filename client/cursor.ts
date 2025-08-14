import {Socket} from "socket.io-client";
import {Canvas} from "./canvas";
import {EventDown, EventUp} from "../common/event";

export class Cursor {
    constructor(private socket: Socket<EventDown, EventUp>) {
        document.addEventListener('pointermove', this.event_handler('cursor-move'));
        document.addEventListener('pointerdown', this.event_handler('cursor-down'));
        document.addEventListener('pointerup', this.event_handler('cursor-up'));
        document.addEventListener('pointercancel', this.event_handler('cursor-up'));
    }

    event_handler(type: keyof EventUp) {
        return (event: PointerEvent) => {
            const bounds = Canvas.ELEMENT.getBoundingClientRect();
            const x = Math.round(256 * (event.x - bounds.x) / bounds.width);
            const y = Math.round(256 * (event.y - bounds.y) / bounds.height);
            this.socket.emit(type, x, y);
        };
    }
}
