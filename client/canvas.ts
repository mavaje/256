import {ColourID, Palette} from "../common/palette";
import {Sprite} from "../common/sprite";
import {ByteArray} from "../common/byte-array";

export class Canvas extends Sprite {
    public static ELEMENT = document.getElementById('canvas') as HTMLCanvasElement;

    private context: CanvasRenderingContext2D;

    public palette: Palette;

    constructor() {
        super(256, 256);
        this.context = Canvas.ELEMENT.getContext('2d');
        this.context.imageSmoothingEnabled = false;
    }

    image_data() {
        if (!this.palette) return null;
        const image_data = new ImageData(this.width, this.height);
        this.pixels.forEach((id: ColourID, i) => {
            const colour = this.palette.get_colour(id);
            const [r, g, b] = colour.rgb_bytes();
            image_data.data[4 * i] = r;
            image_data.data[4 * i + 1] = g;
            image_data.data[4 * i + 2] = b;
            image_data.data[4 * i + 3] = 255;
        });
        return image_data;
    }

    update(buffer: ArrayBuffer) {
        this.pixels = new ByteArray(buffer);
        const image_data = this.image_data();
        if (image_data) this.context.putImageData(image_data, 0, 0);
    }
}
