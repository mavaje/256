import {iRaster} from "../../api/raster";
import {Font} from "./font";
import {load_text_file} from "../../assets/asset_loader";
import {Color} from "./palette";
import {KeyboardKeys} from "../../api/input";

export type Point = [number, number];

export class Raster implements iRaster {

    private static instances: Raster[] = [];

    pixels: number[][];

    private _color = 1;

    private _font: Font = Font.SANS;
    private _cursor: Point = [0, 0];
    private _offset = 0;

    constructor(
        readonly width: number,
        readonly height: number,
        readonly mask: number = null
    ) {
        Raster.instances.push(this);
        this.pixels = [];
        let x: number, y: number;
        for (y = 0; y < height; y++) {
            this.pixels[y] = [];
            for (x = 0; x < width; x++) {
                this.pixels[y][x] = mask ?? 0;
            }
        }
    }

    static async from_file(file_path: string, mask?: number): Promise<Raster> {
        const fallback = mask ?? Color.BLACK;
        const char_map: { [char: string]: number; } = {
            ' ': fallback,
            '#': Color.WHITE,
        };
        const char_matcher = new RegExp(`[0-9a-f${Object.keys(char_map).join('')}]`, 'i');

        const text: string = await load_text_file(file_path);
        if (!text) return null;

        let width: number = 0, height: number;
        const pixels: number[][] = text.split(/\n/g).map(line => {
            const row = [];
            line.split('*')[0].split('').forEach((char, i) => {
                if (i % 2 === 0 && char_matcher.test(char)) {
                    const pixel = char_map[char] ?? parseInt(char, 16) ?? fallback;
                    row.push(pixel);
                }
            });
            width = Math.max(row.length, width);
            return row;
        });

        height = pixels.length;

        const raster = new Raster(width, height, mask);
        let x: number, y: number;
        for (x = 0; x < width; x++) for (y = 0; y < height; y++) {
            raster.pixel([x, y], pixels[y]?.[x] ?? fallback);
        }
        return raster;
    }

    static reset_all() {
        Raster.instances.forEach(raster => {
            raster.cursor = [0, 0];
        });
    }

    set color(color: number) {
        const {round} = Math;
        color = round(color);
        this._color = color;
    }

    pixel([x, y]: Point, color: number) {
        if (color == null) return;
        const {round} = Math;
        x = round(x);
        y = round(y);
        color = round(color);
        if (0 <= x && x < this.width &&
            0 <= y && y < this.height
        ) this.pixels[y][x] = color;
    }

    pixel_at([x, y]: Point): number {
        const {round} = Math;
        x = round(x);
        y = round(y);
        if (0 <= x && x < this.width &&
            0 <= y && y < this.height
        ) return this.pixels[y][x];
        return null;
    }

    clear() {
        this.fill(this.mask ?? Color.BLACK);
    }

    fill(color = this._color) {
        this.rect([0, 0], this.width, this.height, color);
    }

    line([x1, y1]: Point, [x2, y2]: Point, color = this._color) {
        const {abs, round, sign} = Math;
        x1 = round(x1);
        y1 = round(y1);
        x2 = round(x2);
        y2 = round(y2);
        const dx = x2 - x1;
        const dy = y2 - y1;
        let x = x1, y = y1;
        let e = 0;
        const x_major = abs(dx) > abs(dy);
        while (x != x2 || y != y2) {
            this.pixel([x, y], color);
            if (x_major) {
                x += sign(dx);
                e += dy / abs(dx);
            } else {
                y += sign(dy);
                e += dx / abs(dy);
            }
            if (abs(e) > 0.5) {
                if (x_major) {
                    y += sign(e);
                } else {
                    x += sign(e);
                }
                e -= sign(e);
            }
        }
        this.pixel([x, y], color);
    }

    poly_line(points: Point[], color = this._color) {
        let last: Point = null;
        points.forEach(point => {
            if (last) this.line(last, point, color);
            last = point;
        })
    }

    square(point: Point, size: number, fill = this._color, line = fill) {
        this.rect(point, size, size, fill, line);
    }

    rect([x, y]: Point, width: number, height: number, fill = this._color, line = fill) {
        const {abs, round} = Math;
        x = round(x);
        y = round(y);
        width = abs(width);
        height = abs(height);
        line = line ?? fill;
        let dx, dy;
        for (dx = 0; dx < width; dx++) for (dy = 0; dy < height; dy++) {
            const col = dx == 0 || dy == 0 || dx == width - 1 || dy === height - 1 ? line : fill;
            this.pixel([x + dx, y + dy], col);
        }
    }

    circle(point: Point, size: number, fill = this._color, line = fill) {
        this.ellipse(point, size, size, fill, line);
    }

    ellipse([x, y]: Point, width: number, height: number, fill = this._color, line = fill) {
        const {abs, round} = Math;
        x = round(x);
        y = round(y);
        width = abs(width);
        height = abs(height);
        let rx = width / 2;
        let ry = height / 2;
        let rx2 = rx ** 2;
        let ry2 = ry ** 2;
        let dx, dy;
        const inside = [];
        for (dx = 0; dx < rx; dx++) for (dy = 0; dy < ry; dy++) {
            if ((dx + 0.5 - rx) ** 2 / rx2 + (dy + 0.5 - ry) ** 2 / ry2 <= 1) {
                if (!inside[dx]) inside[dx] = [];
                inside[dx][dy] = true;
                const col = inside[dx][dy - 1] && inside[dx - 1]?.[dy] ? fill : line;
                const mx = 2 * dx < width - 1;
                const my = 2 * dy < height - 1;
                this.pixel([x + dx, y + dy], col);
                if (mx) this.pixel([x + width - 1 - dx, y + dy], col);
                if (my) this.pixel([x + dx, y + height - 1 - dy], col);
                if (mx && my) this.pixel([x + width - 1 - dx, y + height - 1 - dy], col);
            }
        }
    }

    polygon(points: Point[], fill = this._color, line = fill) {

        let t: number = null,
            b: number = null,
            l: number = null,
            r: number = null;
        points.forEach(p => {
            if (t === null || p[1] < t) t = p[1];
            if (b === null || p[1] > b) b = p[1];
            if (l === null || p[0] < l) l = p[0];
            if (r === null || p[0] > r) r = p[0];
        });

        const lines: [Point, Point][] = points.map((point, i) => {
            return [point, points[(i + 1) % points.length]];
        });

        let x: number, y: number;
        if (fill != null) for (x = l; x <= r; x++) for (y = t; y <= b; y++) {
            if (lines.reduce((c, [[x1, y1], [x2, y2]]) =>
                (y1 < y) !== (y2 < y) &&
                ((x - x1) * (y2 - y1) - (x2 - x1) * (y - y1) < 0) !== (y2 < y1) ? !c : c,
            false)) this.pixel([x, y], fill);
        }

        line = line ?? fill;
        lines.forEach(([p1, p2]) => this.line(p1, p2, line));
    }

    flood([x, y]: Point, fill = this._color) {
        const old_color = this.pixel_at([x, y]);
        const to_visit: Point[] = [[x, y]];
        const visited: { [p: string]: boolean } = {};
        if (old_color !== fill) while (to_visit.length > 0) {
            const [x, y] = to_visit.pop();
            if (this.pixel_at([x, y]) === old_color) {
                this.pixel([x, y], fill);
                visited[String([x, y])] = true;
                [
                    [x - 1, y],
                    [x + 1, y],
                    [x, y - 1],
                    [x, y + 1],
                ].forEach((next: Point) => {
                    if (!visited[String(next)]) to_visit.push(next);
                })
            }
        }
    }

    set font(font: Font) {
        this._font = font;
    }

    set cursor(cursor: Point) {
        this._cursor = cursor;
        this._offset = 0;
    }

    private print_char(char: number, color: number, font: Font) {
        if (char === KeyboardKeys.NEW_LINE) {
            this._cursor[1] += font.line_height + 1;
            this._offset = 0;
        } else {
            if (this._offset > 0) this._offset++;
            const point: Point = [...this._cursor];
            point[0] += this._offset;
            const glyph = font.glyphs[char];
            this.stamp(glyph, point, undefined, {[Font.FG_COLOR]: color});
            this._offset += glyph.width;
        }
    }

    print(text: string, point?: Point, color = this._color, font = this._font) {
        if (point) this.cursor = point;
        text.split('').forEach(c => this.print_char(c.charCodeAt(0), color, font));
        return;
    }

    text_width(text: string, font = this._font): number {
        let width = 0;
        text.split('\n').forEach(line => {
            let line_width = 0;
            line.split('').forEach(char => {
                const glyph = font.glyphs[char.charCodeAt(0)];
                if (line_width > 0) line_width++;
                line_width += glyph.width;
            });
            width = Math.max(width, line_width);
        })
        return width;
    }

    text_height(text: string, font = this._font): number {
        const n_lines = text.split('\n').length;
        return font.line_height * n_lines + (n_lines - 1);
    }

    fit_text(text: string, color = this._color, font = this._font): Raster {
        const lines = text.trim()
            .split('\n')
            .filter(Boolean)
            .map(line => line.trim());
        let i = 0;
        while (i < lines.length) {
            const words = lines[i]
                .split(' ')
                .filter(Boolean)
                .map(word => word.trim());
            let sub_lines = [];
            let sub_line = '';
            let j = 0;
            while (j < words.length) {
                let word = words[j++];
                let k = word.length - 1;
                let rest = '';
                while (this.text_width(word, font) > this.width) {
                    rest = word[k] + rest;
                    word = word.slice(0, k--);
                }
                if (rest) words.splice(j, 0, rest);
                const test_line = sub_line ? sub_line + ' ' + word : word;
                if (!sub_line || this.text_width(test_line, font) <= this.width) {
                    sub_line = test_line;
                } else {
                    sub_lines.push(sub_line);
                    sub_line = word;
                }
            }
            sub_lines.push(sub_line);
            lines.splice(i, 1, ...sub_lines);
            i += sub_lines.length;
        }
        let truncated = false;
        while (this.text_height(lines.join('\n')) >= this.height) {
            lines.splice(lines.length - 1, 1);
            truncated = true;
        }
        if (truncated) {
            const line_n = lines.length - 1;
            let i = lines[line_n].length - 1;
            while (this.text_width(lines[line_n] + '...') >= this.width) {
                lines[line_n] = lines[line_n].slice(0, i--).trim();
            }
            lines[line_n] += '...';
        }
        text = lines.join('\n');
        const width = this.text_width(text, font);
        const height = this.text_height(text, font);
        const raster = new Raster(width, height, color === 0 ? 1 : 0);
        raster.print(text, [0, 0], color, font);
        return raster;
    }

    sub_raster([x, y]: Point, width: number = this.width, height: number = this.height) {
        const raster = new Raster(width, height, this.mask);
        let dx: number, dy: number;
        for (dx = 0; dx < width; dx++) for (dy = 0; dy < height; dy++) {
            const color = this.pixel_at([x + dx, y + dy]);
            raster.pixel([dx, dy], color);
        }
        return raster;
    }

    stamp(raster: Raster, dst: Point = [0, 0], scale = 1, map: {[color: number]: number} | ((color: number) => number) = {}) {
        if (!raster) return;
        scale = scale > 1 ? Math.floor(scale) : 1 / Math.ceil(1 / scale);
        let x: number, y: number;
        for (x = 0; x < raster.width; x++) for (y = 0; y < raster.height; y++) {
            let color = raster.pixel_at([x, y]);
            if (color !== raster.mask) {
                if (typeof map === 'function') {
                    color = map(color) ?? color;
                } else {
                    color = map[color] ?? color;
                }
                if (scale > 1) {
                    this.square([
                        dst[0] + x * scale,
                        dst[1] + y * scale,
                    ], scale, color);
                } else if (x * scale % 1 === 0 &&
                           y * scale % 1 === 0
                ) {
                    this.pixel([
                        dst[0] + x * scale,
                        dst[1] + y * scale,
                    ], color);
                }
            }
        }
    }

    center(raster: Raster, map: {[color: number]: number} | ((color: number) => number) = {}) {
        const x = (this.width - raster.width) / 2;
        const y = (this.height - raster.height) / 2;
        this.stamp(raster, [x, y], undefined, map);
    }

    contain(raster: Raster, map: {[color: number]: number} | ((color: number) => number) = {}) {
        const [sx, sy] = ['width', 'height'].map(field => this[field] / raster[field]);
        let s = Math.min(sx, sy);
        s = s > 1 ? Math.floor(s) : 1 / Math.ceil(1 / s);
        const x = (this.width - raster.width * s) / 2;
        const y = (this.height - raster.height * s) / 2;
        this.stamp(raster, [x, y], s, map);
    }

    cover(raster: Raster, map: {[color: number]: number} | ((color: number) => number) = {}) {
        const [sx, sy] = ['width', 'height'].map(field => this[field] / raster[field]);
        let s = Math.max(sx, sy);
        s = s > 1 ? Math.ceil(s) : 1 / Math.floor(1 / s);
        const x = (this.width - raster.width * s) / 2;
        const y = (this.height - raster.height * s) / 2;
        this.stamp(raster, [x, y], s, map);
    }

    clone(): Raster {
        const raster = new Raster(this.width, this.height, this.mask);
        raster.fill(this.mask);
        raster.stamp(this);
        return raster;
    }
}
