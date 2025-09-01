import {Client} from "../client";
import {EventTransmitter} from "../event-transmitter";
import {Sprite} from "./sprite";
import {AZURE, BLUE, ColourID, LIME, ORANGE, PINK, PURPLE, RED, YELLOW} from "../../common/palette";

export type CursorMode = 'idle' | 'pointer' | 'loading';
export type CursorState = 'up' | 'down';

export class Cursor {
    x: number = 128;
    y: number = 128;
    mode: CursorMode = 'loading';
    state: CursorState = 'up';

    readonly et = new EventTransmitter();

    constructor(public client: Client) {
        this.et.on('cursor-move', (c, x, y) => {
            if (c === client) {
                this.x = x;
                this.y = y;
            }
        });

        this.et.on('cursor-down', c => {
            if (c === client) {
                this.state = 'up';
            }
        });

        this.et.on('cursor-up', c => {
            if (c === client) {
                this.state = 'down';
            }
        });
    }

    render(sprite: Sprite, tick: number) {
        switch (this.mode) {
            case 'idle':
                return;

            case 'pointer':
                return;

            case 'loading':
                const speed = 1 / 12;
                const dot_size = 2;
                const radius = 6;
                const colours = [
                    RED,
                    ORANGE,
                    YELLOW,
                    LIME,
                    AZURE,
                    BLUE,
                    PURPLE,
                    PINK,
                ];

                colours.forEach((colour: ColourID, i) => {
                    const angle = 2 * Math.PI * i / colours.length + speed * tick;
                    sprite.fill_square(
                        this.x + radius * Math.sin(angle) - dot_size / 2,
                        this.y + radius * Math.cos(angle) - dot_size / 2,
                        dot_size,
                        colour,
                    );
                });

                return;
        }
    }

    destruct() {
        this.et.destruct();
    }
}
