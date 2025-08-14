import {Server} from "./server";
import {Display} from "./display";
import {EventTransmitter} from "./event-transmitter";
import {PaletteFile} from "./file/palette-file";

export class Engine extends EventTransmitter {
    static FRAME_RATE = 30;

    running = false;

    server: Server = new Server();
    display: Display = new Display();

    constructor() {
        super();

        const palette_file = PaletteFile.load('neon', undefined, 'pal');
        PaletteFile.save(palette_file.palette, 'neon');
        this.display.palette = palette_file.palette;
        this.server.serve_palette(this.display.palette)

        this.on('client-joined', client => {
            if (this.display.palette) {
                client.send_palette(this.display.palette);
            }
        });
    }

    start() {
        this.running = true;
        this.server.start();
        this.cycle();
    }

    cycle() {
        if (this.running) {
            const time = Date.now();

            this.display.update();

            this.server.serve_displays(this.display);

            const delay = Math.max(0, 1000 / Engine.FRAME_RATE + time - Date.now());
            setTimeout(()=> this.cycle(), delay);
        }
    }

    stop() {
        this.running = false;
    }
}

if (require.main === module) {
    const engine = new Engine();
    engine.start();
}
