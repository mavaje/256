import {ColourID, ColourMap, GREEN, TRANSPARENT, WHITE} from "./palette";
import {ByteArray} from "./byte-array";

export type StampOptions = {
    scale?: number;
    scale_x?: number;
    scale_y?: number;
    rotate?: number;
    cx?: number;
    cy?: number;
    map?: ColourMap;
};

export class Sprite {
    protected pixels: ByteArray;
    protected supports_transparency = true;

    protected previous_point: [number, number] = [0, 0];

    base_colour: ColourID = TRANSPARENT;
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
            this.clear();
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

    sub(x: number, y: number, width: number, height: number): Sprite {
        const sprite = new Sprite(width, height);

        let ox = 0;
        let oy = 0;

        if (x < 0) {
            width += x;
            ox = -x;
            x = 0;
        }

        if (y < 0) {
            height += y;
            oy = -y;
            y = 0;
        }

        if (x + width > this.width) {
            width = this.width - x;
        }

        if (y + height > this.height) {
            height = this.height - y;
        }

        for (let dy = 0; dy < height; dy++) {
            if (y + dy < 0 || y + dy >= this.height) continue;
            sprite.pixels.push(
                this.pixels.slice(
                    (y + dy) * this.width + x,
                    (y + dy) * this.width + x + width,
                ),
                (dy + oy) * sprite.width + ox,
            );
        }

        return sprite;
    }

    scale(scale: number): Sprite;
    scale(scale_x: number, scale_y: number): Sprite;
    scale(scale_x: number, scale_y: number = scale_x): Sprite {
        const width = Math.ceil(this.width * scale_x);
        const height = Math.ceil(this.height * scale_y);

        const sprite = new Sprite(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                sprite.set_pixel(x, y, this.get_pixel(x / scale_x, y / scale_y));
            }
        }

        return sprite;
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
        x = Math.round(x);
        y = Math.round(y);

        return x >= 0 && x < this.width &&
            y >= 0 && y < this.height;
    }

    get_pixel(x: number, y: number): ColourID {
        if (!this.has_pixel(x, y)) return this.base_colour;

        x = Math.round(x);
        y = Math.round(y);

        return this.pixels[y * this.height + x] as ColourID;
    }

    set_pixel(x: number, y: number, colour: ColourID = this.current_colour) {
        if (this.has_pixel(x, y) && this.is_valid_colour(colour)) {
            x = Math.round(x);
            y = Math.round(y);

            this.pixels[y * this.width + x] = colour;
        }
    }

    fill(colour_id: ColourID = this.current_colour) {
        if (this.is_valid_colour(colour_id)) {
            this.pixels.fill(colour_id);
        }
    }

    clear() {
        this.fill(this.base_colour);
    }

    fill_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        colour: ColourID = this.current_colour,
    ) {
        if (!this.is_valid_colour(colour)) return;

        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);

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

    outline_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        colour: ColourID = this.current_colour,
    ) {
        if (width > 0 && height > 0) {
            const x2 = x + width - 1;
            const y2 = y + height - 1;

            this.line(x, y, x2, y, colour);
            this.line(x, y, x, y2, colour);
            this.line(x, y2, x2, y2, colour);
            this.line(x2, y, x2, y2, colour);
        }
    }

    line(x2: number, y2: number, colour?: ColourID): void;
    line(x1: number, y1: number, x2: number, y2: number, colour?: ColourID): void;
    line(...args: number[]): void {
        let x1: number, y1: number, x2: number, y2: number, colour: number;

        if (args.length < 4) {
            [x1, y1] = this.previous_point;
            [x2, y2, colour = this.current_colour] = args;
        } else {
            [x1, y1, x2, y2, colour = this.current_colour] = args;
        }

        if (!this.is_valid_colour(colour)) return;

        this.previous_point = [x2, y2];

        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);

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

    stamp(sprite: Sprite, dx: number = 0, dy: number = 0, options: StampOptions = {}) {
        const {
            scale = 1,
            scale_x = scale,
            scale_y = scale,
            rotate = 0,
            cx = sprite.width * scale_x / 2,
            cy = sprite.height * scale_y / 2,
            map = {},
        } = options;

        const d_width = sprite.width * scale_x;
        const d_height = sprite.height * scale_y;

        const sin = Math.sin(Math.PI * rotate / 180);
        const cos = Math.cos(Math.PI * rotate / 180);

        let [min_x,,, max_x] = [
            cx - (cos * cx) - (sin * cy),
            cx - (cos * cx) + (sin * (d_height - cy)),
            cx + (cos * (d_width - cx)) - (sin * cy),
            cx + (cos * (d_width - cx)) + (sin * (d_height - cy)),
        ].sort((a, b) => a - b);

        let [min_y,,, max_y] = [
            cy + (sin * cx) - (cos * cy),
            cy + (sin * cx) + (cos * (d_height - cy)),
            cy - (sin * (d_width - cx)) - (cos * cy),
            cy - (sin * (d_width - cx)) + (cos * (d_height - cy)),
        ].sort((a, b) => a - b);

        let id: ColourID;
        for (let x = Math.floor(min_x); x < max_x + 1; x++) {
            for (let y = Math.floor(min_y); y < max_y + 1; y++) {
                const sx = x - cx + 0.5;
                const sy = y - cy + 0.5;

                id = sprite.get_pixel(
                    (cx + cos * sx - sin * sy) / scale_x - 0.5,
                    (cy + sin * sx + cos * sy) / scale_y - 0.5,
                );

                id = map[id] ?? id;

                if (id < TRANSPARENT) {
                    this.set_pixel(
                        dx + x,
                        dy + y,
                        id,
                    );
                }
            }
        }
    }
}
