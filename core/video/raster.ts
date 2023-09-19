import {GlyphMap} from "./glyph_map";

export type Point = [number, number];

export class Raster {

    width: number;
    height: number;
    data: number[][];

    current_color = 1;

    constructor(width = 256, height = 256) {
        this.width = width;
        this.height = height;
        this.data = [];
        let x, y;
        for (y = 0; y < height; y++) {
            this.data[y] = [];
            for (x = 0; x < width; x++) {
                this.data[y][x] = 0;
            }
        }
    }

    set color(color: number) {
        const {round} = Math;
        color = round(color);
        this.current_color = color;
    }

    pixel([x, y]: Point, color = this.current_color) {
        if (color == null) return;
        const {round} = Math;
        x = round(x);
        y = round(y);
        color = round(color);
        if (0 <= x && x < this.width &&
            0 <= y && y < this.height
        ) this.data[y][x] = color;
    }

    pixel_at([x, y]: Point): number {
        const {round} = Math;
        x = round(x);
        y = round(y);
        if (0 <= x && x < this.width &&
            0 <= y && y < this.height
        ) return this.data[y][x];
        return null;
    }

    clear() {
        this.fill(0);
    }

    fill(color = this.current_color) {
        this.rect([0, 0], this.width, this.height, color);
    }

    line([x1, y1]: Point, [x2, y2]: Point, color = this.current_color) {
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

    poly_line(points: Point[], color = this.current_color) {
        let last: Point = null;
        points.forEach(point => {
            if (last) this.line(last, point, color);
            last = point;
        })
    }

    square(point: Point, size: number, fill = this.current_color, line = fill) {
        this.rect(point, size, size, fill, line);
    }

    rect([x, y]: Point, width: number, height: number, fill = this.current_color, line = fill) {
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

    circle(point: Point, size: number, fill = this.current_color, line = fill) {
        this.ellipse(point, size, size, fill, line);
    }

    ellipse([x, y]: Point, width: number, height: number, fill = this.current_color, line = fill) {
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
                (inside[dx] || (inside[dx] = []))[dy] = true;
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

    polygon(points: Point[], fill = this.current_color, line = fill) {

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

    flood([x, y]: Point, fill = this.current_color) {
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

    private _cursor = [0, 0];
    private _offset = 0;

    private print_char(char: number, color: number) {
        if (char === 255) {
            this._offset = 0;
            this._cursor[1] += 8;
        } else {
            const glyph = GlyphMap.glyph(char);
            const [x, y] = this._cursor;
            let dx, dy;
            for (dy = 0; dy < 8; dy++) for (dx = 0; dx < 6; dx++) {
                if (glyph[dy][dx]) {
                    this.pixel([x + this._offset + dx, y + dy], color);
                }
            }
            this._offset += 6;
        }
    }

    set cursor(cursor: Point) {
        this._cursor = cursor;
        this._offset = 0;
    }

    print(text: number | number[], point?: Point, color = this.current_color) {
        if (point) this.cursor = point;
        if (text instanceof Array) {
            text.forEach(c => this.print_char(c, color));
        } else {
            this.print_char(text, color);
        }
        return;
    }

    sub_raster([x, y]: Point, width: number, height: number) {
        const raster = new Raster(width, height);
        let dx, dy;
        for (dx = 0; dx < width; dx++) for (dy = 0; dy < height; dy++) {
            const color = this.pixel_at([x + dx, y + dy]);
            raster.pixel([dx, dy], color);
        }
        return raster;
    }

    stamp(raster: Raster, dst: Point = [0, 0], scale = 1, mask: number = null) {
        scale = Math.floor(scale);
        if (scale < 1) return;
        let x, y;
        for (x = 0; x < raster.width; x++) for (y = 0; y < raster.height; y++) {
            const color = raster.pixel_at([x, y]);
            if (color !== mask) this.square([
                dst[0] + x * scale,
                dst[1] + y * scale,
            ], scale, color);
        }
    }

    clone(): Raster {
        const raster = new Raster(this.width, this.height);
        raster.stamp(this);
        return raster;
    }
}
