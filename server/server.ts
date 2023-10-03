import {iServer} from "../api/server";
import {iClient} from "../api/client";
import {iInput} from "../api/input";
import {iOutput} from "../api/output";

export class Server implements iServer {

    clients: iClient[] = [];

    register_client(client: iClient) {
        this.clients.push(client);
    }

    send(output: iOutput): iInput[] {
        return this.clients.map(client => client.receive(output));
    }
}