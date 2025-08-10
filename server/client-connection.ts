import {Socket} from "socket.io";
import {EventDown, EventUp} from "../api/event";
import {Server} from "./server";

export class ClientConnection {
    id: string;
    disconnected: boolean = false;

    constructor(public server: Server, public socket: Socket<EventUp, EventDown>) {
        this.id = socket.id;

        socket.on('client-id', id => {
            server.assign(this);
        });

        socket.on('disconnect', () => {
            this.disconnected = true;
        });
    }
}
