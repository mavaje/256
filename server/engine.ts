import {Server} from "./server";
import {Display} from "./display";
import {EventTransmitter} from "./event-transmitter";
import {SpriteFile} from "./file/sprite-file";
import {Palette} from "../common/palette";
import {ResourceProvider} from "./resource-provider";

export class Engine extends EventTransmitter {
    static FRAME_RATE = 30;

    running = false;

    resource_provider = new ResourceProvider();

    server: Server = new Server();
    display: Display = new Display(this.resource_provider);

    palette: Palette = this.resource_provider.default_palette;

    constructor() {
        super();

        this.on('client-joined', client => {
            client.send_palette(this.palette);
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
            this.palette,
            `screenshot_${new Date().toISOString()}`,
            'resources/screenshots',
        );
    }
}

if (require.main === module) {
    const engine = new Engine();
    engine.start();
}
