import {iServer} from "../api/server";
import {iClient} from "../api/client";
import {iCursor, iInput, iKeyInput, PlayerInputMap} from "../api/input";
import {iOutput} from "../api/output";
import {KeyboardInput} from "../client/keyboard";

export class Server implements iServer {

    clients: iClient[] = [];

    register_client(client: iClient) {
        this.clients.push(client);
    }

    async send(output: iOutput): Promise<iInput> {
        const inputs = await Promise.all(
            this.clients.map(client => client.receive(output))
        );

        const keyboard: iKeyInput = { keys: {} };
        const players: PlayerInputMap = {};
        const cursor: iCursor = {
            position: [...output.cursor.position],
            pressed: false,
        };

        inputs.forEach(input => {
            Object.entries(input.keyboard.keys).forEach(([key, state]) => {
                if (state) keyboard.keys[key] = true;
            });
            Object.entries(input.players).forEach(([id, player]) => players[id] = player);
            [0, 1].forEach(i => cursor.position[i] += input.cursor.position[i] - output.cursor.position[i]);
            cursor.pressed ||= input.cursor.pressed;
        });

        return {
            keyboard,
            players,
            cursor,
        };
    }
}