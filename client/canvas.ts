import {Display} from "../common/display";

export class Canvas extends Display {
    element: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor() {
        super();
        this.element = document.createElement('canvas');
        this.element.width = this.element.height = 256;
        this.context = this.element.getContext('2d');
    }

    update(buffer: ArrayBufferLike) {
        this.pixels = new Uint8Array(buffer);
        this.render();
    }

    render() {
        if (this.palette) {
            for (let x = 0; x < 256; x++) for (let y = 0; y < 256; y++) {
                const colour_id = this.get_colour(x, y);
                this.context.fillStyle = this.palette.get_colour(colour_id).hex();
                this.context.fillRect(x, y, 1, 1);
            }
        }
    }
}
