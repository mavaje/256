import {Controller} from "../../core/control/controller";
import {CursorEventType, Event, EventType, KeyEventType} from "../../core/control/event";

export class WebController implements Controller {

    element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    initialise(handle: (event: Event) => boolean) {
        const rect = this.element.getBoundingClientRect();

        const mouse_event = (type: CursorEventType, x: number, y: number): Event => ({
            type,
            data: {
                point: [
                    Math.round((x - rect.x) * 256 / rect.width),
                    Math.round((y - rect.y) * 256 / rect.height),
                ]
            }
        });

        const key_event = (type: KeyEventType, key: string): Event => ({
            type,
            data: {
                key: this.key_map(key)
            }
        });

        this.element.addEventListener('mousedown', ({x, y}) => handle(mouse_event('cursor-press', x, y)));
        document.addEventListener('mouseup', ({x, y}) => handle(mouse_event('cursor-release', x, y)));
        document.addEventListener('mousemove', ({x, y}) => handle(mouse_event('cursor-move', x, y)));
        document.addEventListener('keydown', ({key}) => handle(key_event('key-press', key)));
        document.addEventListener('keyup', ({key}) => handle(key_event('key-release', key)));
    }

    private key_map(key: string): number {
        return {
            '0': 0,
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            'A': 10,
            'B': 11,
            'C': 12,
            ' ': 127,
            'Enter': 255,
        }[key] ?? null;
    }
}
