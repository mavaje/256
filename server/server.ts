import express from 'express';
import http from 'http';
import {Server as SocketIO} from 'socket.io';
import {ClientConnection} from "./client-connection";
import path from "path";
import {EventDown, EventUp} from "../api/event";

export class Server {
    connections: {
        [id: string]: ClientConnection;
    } = {};

    start() {
        const app = express();
        const server = http.createServer(app);
        const io = new SocketIO<EventUp, EventDown>(server);

        app.use(express.static(path.join(__dirname, '../client/public')));

        io.on('connection', socket => {
            this.assign(new ClientConnection(this, socket));
        });

        server.listen(0, () => {
            const address = server.address();
            console.log('listening on', address, 0);
        });
    }

    assign(connection: ClientConnection) {
        Object.values(this.connections)
            .filter(({id}) => id === connection.id)
            .forEach(({id}) => delete this.connections[id])
        this.connections[connection.id] = connection;
    }
}
