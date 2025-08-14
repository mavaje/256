import {Socket} from "socket.io-client";
import {EventDown, EventUp} from "../common/event";

export class Keyboard {

    constructor(socket: Socket<EventDown, EventUp>) {
        document.addEventListener('keydown', (event) => {
            console.log(event);
        });
    }
}
