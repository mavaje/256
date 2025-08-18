import {Server} from "./server";
import {Display} from "./display";
import {EventTransmitter} from "./event-transmitter";
import {PaletteFile} from "./file/palette-file";
import {SpriteFile} from "./file/sprite-file";
import {Palette} from "../common/palette";

export class Engine extends EventTransmitter {
    static FRAME_RATE = 30;

    running = false;

    server: Server = new Server();
    display: Display = new Display();
    palette: Palette = null;

    constructor() {
        super();

        const palette_file = PaletteFile.load('neon');
        this.palette = palette_file.palette;

        palette_file.save('neon-test');

        const test = SpriteFile.load(
            palette_file.palette,
            'active-32', '/Users/mjensen/wreck/dst/icons',
        );

        test.save('hammer', SpriteFile.PATH);

        if (test.exists()) this.display.stamp(test.sprite);

        this.on('client-joined', client => {
            client.send_palette(this.palette);
        });

        this.on('cursor-down', () => this.screenshot());
    }

    start() {
        this.running = true;
        this.server.start();
        this.cycle();
    }

    cycle() {
        if (this.running) {
            const time = Date.now();

            // this.display.update();

            this.server.serve_displays(this.display);

            const delay = Math.max(0, 1000 / Engine.FRAME_RATE + time - Date.now());
            setTimeout(()=> this.cycle(), delay);
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
