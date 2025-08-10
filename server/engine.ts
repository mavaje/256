import {Server} from "./server";

export class Engine {

    server: Server = new Server();

    start() {
        this.server.start();
    }
}

if (require.main === module) {
    const engine = new Engine();
    engine.start();
}
