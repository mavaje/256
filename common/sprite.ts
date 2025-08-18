import {ColourID, TRANSPARENT} from "./palette";
import {ByteArray} from "./byte-array";

export class Sprite {
    protected pixels: ByteArray;
    protected _has_transparency = false;
    protected _supports_transparency = true;

    constructor(
        public width: number,
        public height: number,
        pixels: ArrayLike<number> = null,
    ) {
        this.pixels = new ByteArray(width * height);

        if (pixels) {
            this.pixels.set(pixels);
            this.update_transparency();
        } else {
            this.fill(TRANSPARENT);
        }
    }

    protected update_transparency() {
        if (this._supports_transparency) {
            this._has_transparency = this.pixels.some(id => id === TRANSPARENT);
        }
    }

    protected is_valid_colour(colour_id: ColourID) {
        return this._supports_transparency
            ? colour_id <= TRANSPARENT
            : colour_id < TRANSPARENT;
    }

    has_transparency() {
        return this._supports_transparency && this._has_transparency;
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
        return this.pixels[y * this.height + x] as ColourID;
    }

    set_pixel(x: number, y: number, colour_id: ColourID) {
        if (this.has_pixel(x, y) && this.is_valid_colour(colour_id)) {
            this.pixels[y * this.height + x] = colour_id;
            if (this._supports_transparency) {
                if (colour_id === TRANSPARENT) {
                    this._has_transparency = true;
                } else {
                    this.update_transparency();
                }
            }
        }
    }

    fill(colour_id: ColourID) {
        if (this.is_valid_colour(colour_id)) {
            this.pixels.fill(colour_id);
            if (this._supports_transparency) {
                this._has_transparency = colour_id === TRANSPARENT;
            }
        }
    }

    fill_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        colour_id: ColourID,
    ) {
        if (!this.is_valid_colour(colour_id)) return;

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
                    colour_id,
                    (y + dy) * this.width + x,
                    (y + dy) * this.width + x + width,
                );
            }

            if (colour_id === TRANSPARENT) {
                this._has_transparency = true;
            } else {
                this.update_transparency();
            }
        }
    }

    stamp(sprite: Sprite, x: number = 0, y: number = 0) {
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
                    if (sprite.has_transparency()) {
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

            if (this.has_transparency()) {
                this.update_transparency();
            }
        }
    }
}
