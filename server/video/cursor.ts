import {Point, Raster} from "./raster";
import {Color} from "./palette";
import {iCursor, iInput} from "../../api/input";
import {Renderable} from "./renderable";
import {CONFIG} from "../../config";

export class Cursor implements iCursor, Renderable {

    static POINTER: Cursor;
    static HAND: Cursor;

    color = Color.WHITE;

    raster_default: Raster;
    raster_pressed: Raster;

    position: Point = [0, 0];
    pressed = false;

    constructor(private offset: Point = [0, 0]) {}

    static async load() {
        Cursor.POINTER = await Cursor.load_cursor('pointer', undefined, Color.PINK);
        Cursor.HAND = await Cursor.load_cursor('hand', [2, 1], Color.PINK);
    }

    static async load_cursor(cursor_name: string, offset?: Point, mask?: number): Promise<Cursor> {
        const cursor = new Cursor(offset);

        cursor.raster_default = await Raster.from_file(`cursors/${cursor_name}/default`, mask);
        cursor.raster_pressed = await Raster.from_file(`cursors/${cursor_name}/pressed`, mask) ?? cursor.raster_default;

        return cursor;
    }

    update(input: iInput) {
        this.position[0] = input.cursor.position[0];
        this.position[1] = input.cursor.position[1];
        this.pressed = input.cursor.pressed;
    }

    render(raster: Raster) {
        const point = [0, 1].map(i => this.position[i] - this.offset[i]) as Point;
        raster.stamp(this.pressed ? this.raster_pressed : this.raster_default, point);
    }
}