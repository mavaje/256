import {BLACK, ColourID, TRANSPARENT, WHITE} from "./palette";
import {ByteArray} from "./byte-array";

export type StampOptions = {
    scale?: number;
    scale_x?: number;
    scale_y?: number;
    rotate?: number;
};

export class Sprite {
    protected pixels: ByteArray;
    protected supports_transparency = true;

    protected previous_point: [number, number] = [0, 0];

    current_colour: ColourID = WHITE;

    constructor(
        public width: number,
        public height: number,
        pixels: ArrayLike<number> = null,
    ) {
        this.pixels = new ByteArray(width * height);

        if (pixels) {
            this.pixels.set(pixels);
        } else {
            this.fill(TRANSPARENT);
        }
    }

    protected is_valid_colour(colour: number = this.current_colour): colour is ColourID {
        return this.supports_transparency
            ? colour <= TRANSPARENT
            : colour < TRANSPARENT;
    }

    has_transparency() {
        return this.pixels.some(id => id === TRANSPARENT);
    }

    array_2d(column_major = false): number[][] {
        const array: number[][] = [];

        if (column_major) {
            for (let x = 0; x < this.width; x++) {
                const column = [];
                array.push(column);
                for (let y = 0; y < this.height; y++) {
                    column.push(this.get_pixel(x, y));
                }
            }
        } else {
            for (let y = 0; y < this.height; y++) {
                const row = [];
                array.push(row);
                for (let x = 0; x < this.width; x++) {
                    row.push(this.get_pixel(x, y));
                }
            }
        }

        return array;
    }

    has_pixel(x: number, y: number): boolean {
        return x >= 0 && x < this.width &&
            y >= 0 && y < this.height;
    }

    get_pixel(x: number, y: number): ColourID {
        x = Math.floor(x);
        y = Math.floor(y);

        return this.pixels[y * this.height + x] as ColourID;
    }

    set_pixel(x: number, y: number, colour: ColourID = this.current_colour) {
        x = Math.floor(x);
        y = Math.floor(y);

        if (this.has_pixel(x, y) && this.is_valid_colour(colour)) {
            this.pixels[y * this.height + x] = colour;
        }
    }

    fill(colour_id: ColourID = this.current_colour) {
        if (this.is_valid_colour(colour_id)) {
            this.pixels.fill(colour_id);
        }
    }

    clear() {
        this.fill(this.supports_transparency ? TRANSPARENT : BLACK);
    }

    fill_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        colour: ColourID = this.current_colour,
    ) {
        if (!this.is_valid_colour(colour)) return;

        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        height = Math.floor(height);

        if (x < 0) {
            width += x;
            x = 0;
        }

        if (y < 0) {
            height += y;
            y = 0;
        }

        width = Math.min(width, 256 - x);
        height = Math.min(height, 256 - y);

        if (width > 0 && height > 0) {
            for (let dy = 0; dy < height; dy++) {
                this.pixels.fill(
                    colour,
                    (y + dy) * this.width + x,
                    (y + dy) * this.width + x + width,
                );
            }
        }
    }

    line(x1: number, y1: number, colour?: ColourID): void;
    line(x1: number, y1: number, x2: number, y2: number, colour?: ColourID): void;
    line(...args: number[]): void {
        let x1: number, y1: number, x2: number, y2: number, colour: number;

        if (args.length < 4) {
            [x1, y1, colour = this.current_colour] = args;
            [x2, y2] = this.previous_point;
        } else {
            [x1, y1, x2, y2, colour = this.current_colour] = args;
        }

        if (!this.is_valid_colour(colour)) return;

        this.previous_point = [x1, y1];

        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = Math.sign(x2 - x1);
        const sy = Math.sign(y2 - y1);

        let x = x1;
        let y = y1;
        let error = dx - dy;

        while (true) {
            this.set_pixel(x, y, colour);
            if (x === x2 && y === y2) return;
            const e2 = error * 2;
            if (e2 > -dy) {
                error -= dy;
                x += sx;
            }
            if (e2 < dx) {
                error += dx;
                y += sy;
            }
        }
    }

    stamp(sprite: Sprite, x: number = 0, y: number = 0, options: StampOptions = {}) {
        x = Math.floor(x);
        y = Math.floor(y);
        const {
            scale = 1,
            scale_x = scale,
            scale_y = scale,
            rotate = 0,
        } = options;

        const transparent = sprite.has_transparency();

        const sx1 = Math.max(x, 0);
        const sx2 = Math.min(x + sprite.width, 256);
        if (sx1 < sx2) {
            for (let sy = 0; sy < sprite.height; sy++) {
                if (y + sy >= 0 && y + sy < 256) {
                    const dx1 = sx1 - x;
                    const dx2 = sx2 - x;
                    const row = sprite.pixels.slice(
                        sy * sprite.width + dx1,
                        sy * sprite.width + dx2,
                    );
                    if (transparent) {
                        row.forEach((id: ColourID, i) => {
                            if (id < TRANSPARENT) {
                                this.pixels[(y + sy) * this.width + sx1 + i] = id;
                            }
                        });
                    } else {
                        this.pixels.push(row, (y + sy) * this.width + sx1);
                    }
                }
            }
        }
    }
}
