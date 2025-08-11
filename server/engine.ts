import {readFile} from "node:fs/promises";
import {Server} from "./server";
import {Display} from "../common/display";
import {Colour} from "../common/colour";
import {Palette} from "../common/palette";
import {EV} from "./ev";

export class Engine {
    static FRAME_RATE = 30;

    running = false;

    server: Server = new Server();
    display: Display = new Display();

    start() {
        this.running = true;
        this.server.start();
        this.cycle();

        EV.on('new-client', client => {
            if (this.display.palette) {
                client.send_palette(this.display.palette);
            }
        });

        this.load_palette('neon');
    }

    cycle() {
        if (this.running) {
            const time = Date.now();

            this.display.randomise();
            this.server.serve_displays(this.display);

            const delay = Math.max(0, 1000 / Engine.FRAME_RATE + time - Date.now());
            setTimeout(()=> this.cycle(), delay);
        }
    }

    async load_palette(name: string) {
        const filename = `resources/palettes/${name}.pal`;
        const content = await readFile(filename, 'utf8');
        const palette = new Palette(content
            .split('\n')
            .filter(Boolean)
            .map(Colour.from_hex));
        this.display.palette = palette;
        this.server.serve_palette(palette);
    }

    stop() {
        this.running = false;
    }
}

if (require.main === module) {
    const engine = new Engine();
    engine.start();
}
