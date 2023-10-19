import {Renderable} from "./renderable";
import {Point, Raster} from "./raster";
import {iInput} from "../../api/input";
import {Color} from "./palette";
import {Cursor} from "./cursor";

type RenderFunc = (
    raster: Raster,
    opts: {
        hovered: boolean;
        pressed: boolean;
    }
) => void;

export type Button = {
    mask?: number;

    default: Raster;
    hovered: Raster;
    pressed: Raster;

    particle_colors?: [Color, Color?, Color?];
}

export class Clickable implements Renderable {

    static BUTTON_CLOSE: Button;
    static BUTTON_MINIMISE: Button;
    static BUTTON_EXPAND: Button;

    hovered = false;
    pressed = false;

    private sub_raster: Raster;
    private _render: RenderFunc;

    private _on_click: () => void;
    private _on_drag: (d: {
        position: Point;
        move: Point;
    }) => void;

    private drag_start?: Point;


    constructor(
        protected position: Point,
        protected width: number,
        protected height: number,
        render?: RenderFunc,
        public mask: number = render ? null : Color.BLACK,
        public particle_colors?: [Color, Color?, Color?],
    ) {
        this.resize();
        this._render = render;
    }

    static button(button: Button, position: Point, click?: () => void) {
        const clickable = new Clickable(
            position,
            button.default.width,
            button.default.height,
            (raster, {hovered, pressed}) => {
                raster.clear();
                raster.stamp(
                    pressed ? button.pressed :
                    hovered ? button.hovered :
                    button.default
                );
            },
            button.mask,
            button.particle_colors,
        );
        if (click) clickable.on_click(click);
        return clickable;
    }

    static async load() {
        Clickable.BUTTON_CLOSE = await Clickable.load_button('close', Color.GREEN, [Color.PINK, Color.RED, Color.BROWN]);
        Clickable.BUTTON_MINIMISE = await Clickable.load_button('minimise', Color.GREEN, [Color.CYAN, Color.BLUE, Color.NAVY]);
        Clickable.BUTTON_EXPAND = await Clickable.load_button('expand', Color.PINK, [Color.YELLOW, Color.LIME, Color.GREEN]);
    }

    static async load_button(name: string, mask?: number, particle_colors?: [Color, Color?, Color?]): Promise<Button> {
        const modes = {mask, particle_colors};
        for (const mode of [
            'default',
            'hovered',
            'pressed',
        ]) {
            const button = await Raster.from_file(`buttons/${name}/${mode}`, mask);
            modes[mode] = button ?? modes['default'];
        }
        return modes as Button;
    }

    on_click(handler: () => void) {
        this._on_click = handler;
    }

    on_drag(handler: (d: {
        position: Point;
        move: Point;
    }) => void) {
        this._on_drag = handler;
    }

    resize(position = this.position, width = this.width, height = this.height) {
        if (this.drag_start) {
            this.drag_start[0] += position[0] - this.position[0];
            this.drag_start[1] += position[1] - this.position[1];
        }
        this.position = position;
        this.width = width;
        this.height = height;
        this.sub_raster = new Raster(this.width, this.height, this.mask);
    }

    update(input: iInput) {
        const {cursor, handled} = input;
        if (handled) {
            this.hovered = false;
            this.pressed = false;
            this.drag_start = null;
            return;
        }
        const hovered = cursor &&
            this.position[0] <= cursor.position[0] &&
            cursor.position[0] < this.position[0] + this.width &&
            this.position[1] <= cursor.position[1] &&
            cursor.position[1] < this.position[1] + this.height;
        if (hovered) {
            if (cursor.pressed) {
                if (!this.pressed && this.hovered && this._on_drag) {
                    this.drag_start = Cursor.position();
                }
            } else if (this.pressed) {
                this._on_click?.();
            }
            this.pressed = cursor.pressed;
        } else if (!this.drag_start) {
            this.pressed = false;
        }
        this.hovered = hovered;
        if (!cursor?.pressed) this.drag_start = null;
        if (this.drag_start) {
            input.handled = true;
            const position = Cursor.position();
            this._on_drag?.({
                position: [
                    cursor.position[0] - this.position[0],
                    cursor.position[1] - this.position[1],
                ],
                move: [
                    position[0] - this.drag_start[0],
                    position[1] - this.drag_start[1],
                ],
            });
            this.drag_start = position;
            if (hovered) Cursor.create_particles(1, this.particle_colors);
        }
        if (this.hovered || this.drag_start) {
            Cursor.cursor_ready();
            if (this.particle_colors) Cursor.color_particles(this.particle_colors);
        }
    }

    render(raster: Raster) {
        const {hovered, pressed} = this;
        this._render?.(this.sub_raster, {hovered, pressed});
        raster.stamp(this.sub_raster, this.position);
    }
}