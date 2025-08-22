import {Server} from "./server";
import {Display} from "./graphics/display";
import {EventTransmitter} from "./event-transmitter";
import {SpriteFile} from "./file/sprite-file";
import {Resources} from "./resources";

export class Engine extends EventTransmitter {
    static FRAME_RATE = 30;

    running = false;

    server: Server = new Server();
    display: Display = new Display();

    constructor() {
        super();

        this.on('client-joined', client => {
            client.send_palette(Resources.palette());
        });
    }

    start() {
        this.running = true;
        this.server.start();
        this.cycle();
    }

    cycle(tick: number = 0) {
        if (this.running) {
            const time = Date.now();

            this.display.update(tick);

            this.server.serve_displays(this.display);

            const delay = Math.max(0, 1000 / Engine.FRAME_RATE + time - Date.now());
            setTimeout(()=> this.cycle(tick + 1), delay);
        }
    }

    stop() {
        this.running = false;
    }

    screenshot() {
        SpriteFile.save(
            this.display,
            Resources.palette(),
            `screenshot_${new Date().toISOString()}`,
            'resources/screenshots',
        );
    }
}

if (require.main === module) {
    const engine = new Engine();
    engine.start();
}
