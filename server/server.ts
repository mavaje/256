import path from "path";
import express from 'express';
import http from 'http';
import {Server as SocketIO} from 'socket.io';
import {Client} from "./client";
import {EventDown, EventUp} from "../common/event";
import {Display} from "../common/display";
import {Palette} from "../common/palette";
import {EV} from "./ev";

export class Server {
    static PORT = 256;

    clients: {
        [id: string]: Client;
    } = {};

    start() {
        const app = express();
        const server = http.createServer(app);
        const io = new SocketIO<EventUp, EventDown>(server);

        app.use(express.static(path.join(__dirname, '../client/public')));
        app.get('/', (_, response) =>
            response.type('html').sendFile(path.join(__dirname, '../client/client.html')));

        io.on('connection', socket => {
            const client = new Client(socket);
            client.attach_to(this);
            EV.emit('new-client', client);
        });

        server.listen(Server.PORT, () => {
            const address = server.address();
            console.log('listening on', address, Server.PORT);
        });
    }

    assign(client: Client) {
        Object.entries(this.clients)
            .filter(([_, {id}]) => id === client.id)
            .forEach(([id]) => delete this.clients[id]);
        this.clients[client.id] = client;
    }

    serve_palette(palette: Palette) {
        Object.values(this.clients)
            .filter(({disconnected}) => !disconnected)
            .forEach(client => client.send_palette(palette));
    }

    serve_displays(display: Display) {
        Object.values(this.clients)
            .filter(({disconnected}) => !disconnected)
            .forEach(client => client.send_display(display));
    }
}
