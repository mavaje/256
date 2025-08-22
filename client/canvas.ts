import {ColourID, Palette} from "../common/palette";
import {ByteArray} from "../common/byte-array";

export class Canvas {
    public static ELEMENT = document.getElementById('canvas') as HTMLCanvasElement;

    private context: CanvasRenderingContext2D;

    public palette: Palette;

    constructor() {
        this.context = Canvas.ELEMENT.getContext('2d');
        this.context.imageSmoothingEnabled = false;

        window.addEventListener('resize', () => this.resize_to_fit());

        this.resize_to_fit();
    }

    resize_to_fit() {
        const scale = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 256) * 256;
        Canvas.ELEMENT.style.width = `${scale}px`;
        Canvas.ELEMENT.style.height = `${scale}px`;
    }

    update(buffer: ArrayBuffer) {
        if (!this.palette) return null;

        const array = new ByteArray(buffer);
        const image_data = new ImageData(256, 256);
        for (let i = 0; i < image_data.data.length; i++) {
            const id = i % 2 === 0
                ? array[i >> 1] >> 4
                : array[i - 1 >> 1] & 0xf;

            const colour = this.palette.get_colour(id as ColourID);
            const [r, g, b] = colour.rgb_bytes();

            image_data.data[4 * i] = r;
            image_data.data[4 * i + 1] = g;
            image_data.data[4 * i + 2] = b;
            image_data.data[4 * i + 3] = 255;
        }

        this.context.putImageData(image_data, 0, 0);
    }
}
