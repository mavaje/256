import {Point, Raster} from "./raster";
import {Colour} from "./palette";
import {iInput} from "../../api/input";
import {iCursor} from "../../api/cursor";

export class Cursor implements iCursor {

    static POINTER: Cursor;
    static HAND: Cursor;

    position: Point = [0, 0];
    color = Colour.WHITE;

    raster_default: Raster;
    raster_pressed: Raster;

    constructor(private offset: Point = [0, 0]) {}

    static async load_cursors() {
        Cursor.POINTER = await Cursor.load('pointer');
        Cursor.HAND = await Cursor.load('hand', [2, 1]);
    }

    static async load(cursor_name: string, offset?: Point): Promise<Cursor> {
        const cursor = new Cursor(offset);

        cursor.raster_default = await Raster.from_file(`cursors/${cursor_name}/default`);
        cursor.raster_pressed = await Raster.from_file(`cursors/${cursor_name}/pressed`) ?? cursor.raster_default;

        return cursor;
    }

    handle_input(inputs: iInput[]) {
        this.position = inputs[0].cursor.position;
    }

    render(raster: Raster) {
        const pressed = false;
        const point = [0, 1].map(i => this.position[i] - this.offset[i]) as Point;
        raster.stamp(pressed ? this.raster_pressed : this.raster_default, point, 1, 0);
    }
}