import {ColourID, ColourMap, TRANSPARENT, WHITE} from "../../common/palette";
import {ByteArray} from "../../common/byte-array";
import {Resources} from "../resources";

export type StampOptions = {
    scale?: number;
    scale_x?: number;
    scale_y?: number;
    rotate?: number;
    cx?: number;
    cy?: number;
    map?: ColourMap;
    smooth?: boolean;
};

export type PrintOptions = {
    font?: string;
    colour?: ColourID;
    scale_x?: number;
    scale_y?: number;
    scale?: number;
    rotate?: number;
    cx?: number;
    cy?: number;
};

export class Sprite {
    protected pixels: ByteArray;
    protected supports_transparency = true;

    base_colour: ColourID = TRANSPARENT;
    current_colour: ColourID = WHITE;
    font: string = Resources.DEFAULT_FONT_NAME;

    constructor(
        public width: number,
        public height: number,
        source?: ArrayLike<number>,
    ) {
        this.pixels = new ByteArray(width * height);

        if (source) {
            this.pixels.set(source);
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
            if (y + dy >= this.height) break;
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

    get_pixel(x: number, y: number, smooth: boolean = false): ColourID {
        if (smooth) {

            const local_x = Math.round(x);
            const local_y = Math.round(y);

            const dir_x = Math.sign(x - local_x);
            const dir_y = Math.sign(y - local_y);

            const dx = Math.abs(x - local_x);
            const dy = Math.abs(y - local_y);

            const x_major = Math.abs(x - local_x) > Math.abs(y - local_y);

            const d_major = x_major ? dx : dy;
            const d_minor = x_major ? dy : dx;

            const pixel = (major: number, minor: number): ColourID => x_major
                ? this.get_pixel(
                    local_x + major * dir_x,
                    local_y + minor * dir_y,
                )
                : this.get_pixel(
                    local_x + minor * dir_x,
                    local_y + major * dir_y,
                );

            const pixel_0_0 = pixel(0, 0);
            const pixel_0_1 = pixel(0, 1);
            const pixel_1_0 = pixel(1, 0);
            const pixel_1_1 = pixel(1, 1);

            const local_line = pixel_0_0 === pixel_1_1 && pixel_0_0 < TRANSPARENT;

            const cross_line = pixel_0_1 === pixel_1_0;

            return !local_line && cross_line && (dx + dy > 0.5)
                ? pixel_0_1
                : pixel_0_0;

        } else {
            if (!this.has_pixel(x, y)) return this.base_colour;

            x = Math.round(x);
            y = Math.round(y);

            return this.pixels[y * this.width + x] as ColourID;
        }
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

    protected previous_point: [number, number] = [0, 0];
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
            smooth = true,
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
                    smooth,
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

    print_line(text: string, options?: PrintOptions): void;
    print_line(text: string, x: number, y: number, options?: PrintOptions): void;
    print_line(text: string, ...rest: any[]): void {
        this.print(text + '\n', ...rest);
    }


    protected previous_print: [number, number] = [1, 1];
    print(text: string, options?: PrintOptions): void;
    print(text: string, x: number, y: number, options?: PrintOptions): void;
    print(text: string, ...rest: any[]): void {
        let [x, y] = this.previous_print;
        let options: PrintOptions;
        switch (typeof rest[0]) {
            case 'object':
                [options] = rest;
                break;
            case 'number':
                [x, y, options] = rest;
                break;
        }

        const {
            font: font_name = this.font,
            colour = this.current_colour,
            scale = 1,
            scale_x = scale,
            scale_y = scale,
            // rotate = 0,
            // cx = sprite.width * scale_x / 2,
            // cy = sprite.height * scale_y / 2,
        } = options ?? {};

        let offset_x = x;
        let offset_y = y;
        const font = Resources.font(font_name);

        if (!font) {
            throw new Error(`Font not found! ${font_name}`);
        }

        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code === 0x0a) {
                offset_x = x;
                offset_y += (font.height + 1) * scale_y;
            } else {
                const glyph = font.glyph(code);
                if (glyph) {
                    this.stamp(
                        glyph,
                        offset_x - scale_x,
                        offset_y - scale_y,
                        {
                            scale_x,
                            scale_y,
                            map: {
                                [WHITE]: colour,
                            },
                        },
                    );
                    offset_x += (glyph.width - 1) * scale_x;
                }
            }
        }

        this.previous_print = [offset_x, offset_y];
    }
}
