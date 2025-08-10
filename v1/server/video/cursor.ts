import {Point, Raster} from "./raster";
import {Color} from "./palette";
import {iCursor, iInput} from "../../api/input";
import {Renderable} from "./renderable";

export class Cursor implements iCursor, Renderable {

    static instance: Cursor;

    static POINTER: Cursor;
    static HAND: Cursor;

    color = Color.WHITE;

    raster_up: Raster;
    raster_down: Raster;
    raster_ready_up: Raster;
    raster_ready_down: Raster;

    position: Point = [0, 0];
    pressed = false;
    ready = false;

    particles: {
        position: Point,
        velocity: Point,
        colors: [Color, Color?, Color?],
        life: number;
        new: boolean;
    }[] = [];

    constructor(private offset: Point = [0, 0]) {
        Cursor.instance = this;
    }

    static cursor_ready(ready: boolean = true) {
        Cursor.instance.ready = ready;
    }

    static shift(input: iInput, offset: Point, callback: () => void) {
        const {cursor} = input;
        if (cursor) {
            input.cursor.position[0] -= offset[0];
            input.cursor.position[1] -= offset[1];
        }
        callback();
        if (cursor) {
            input.cursor.position[0] += offset[0];
            input.cursor.position[1] += offset[1];
        }
    }

    static async load() {
        Cursor.POINTER = await Cursor.load_cursor('pointer', [0, 0], Color.PINK);
        Cursor.HAND = await Cursor.load_cursor('hand', [0, 0], Color.PINK);
    }

    static async load_cursor(cursor_name: string, offset?: Point, mask?: number): Promise<Cursor> {
        const cursor = new Cursor(offset);

        cursor.raster_up = await Raster.from_file(`cursors/${cursor_name}/up`, mask);
        cursor.raster_down = await Raster.from_file(`cursors/${cursor_name}/down`, mask);
        cursor.raster_ready_up = await Raster.from_file(`cursors/${cursor_name}/ready_up`, mask);
        cursor.raster_ready_down = await Raster.from_file(`cursors/${cursor_name}/ready_down`, mask);

        return cursor;
    }

    static color_particles(colors: [Color, Color?, Color?]) {
        Cursor.instance.particles.forEach(particle => {
            if (particle.new) {
                particle.colors = colors;
            }
        })
    }

    static create_particles(n: number, colors?: [Color, Color?, Color?]) {
        Cursor.instance.create_particles(n, colors);
    }

    static position(): Point {
        return [...Cursor.instance.position];
    }

    update({cursor}: iInput) {
        this.update_particles();
        if (cursor) {
            this.position[0] = cursor.position[0];
            this.position[1] = cursor.position[1];
            if (cursor.pressed && !this.pressed) this.create_particles();
            this.pressed = cursor.pressed;
        }
    }

    render(raster: Raster) {
        this.render_particles(raster);
        let cursor: Raster;
        if (this.ready) {
            cursor = this.pressed ? this.raster_ready_down : this.raster_ready_up;
        } else {
            cursor = this.pressed ? this.raster_down : this.raster_up;
        }
        raster.stamp(cursor, [
            this.position[0] - this.offset[0],
            this.position[1] - this.offset[1],
        ]);
    }

    create_particles(n = 16, colors = [
        Color.WHITE,
        Color.SILVER,
        Color.GREY,
    ] as [Color, Color?, Color?]) {
        for (let i = 0; i < n; i++) {
            const angle = 2 * Math.PI * Math.random();
            const speed = 1 + 2 * Math.random();
            this.particles.push({
                position: [...this.position],
                velocity: [
                    speed * Math.sin(angle),
                    speed * Math.cos(angle),
                ],
                life: 16 + 16 * Math.random(),
                colors,
                new: true,
            });
        }
    }

    update_particles() {
        this.particles.forEach(particle => {
            particle.position[0] += particle.velocity[0];
            particle.position[1] += particle.velocity[1];
            particle.velocity[1] += 0.2;
            particle.life--;
            particle.new = false;
        });
        this.particles = this.particles.filter(particle => particle.life > 0);
    }

    render_particles(raster: Raster) {
        this.particles.forEach(particle =>
            raster.pixel(particle.position, particle.colors[
                particle.life > 16 ? 0 :
                particle.life > 8 ? 1 :
                2
            ])
        );
    }
}