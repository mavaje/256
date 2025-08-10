import {Point, Raster} from "../raster";
import {Renderable} from "../renderable";
import {iInput} from "../../../api/input";
import {Color} from "../palette";
import {Button, Clickable} from "../clickable";
import {CONFIG} from "../../../config";
import {OS} from "../../os";
import {MathPlus} from "../../../util/math-plus";
import {Cursor} from "../cursor";

export abstract class Window implements Renderable {

    MIN_WIDTH = 48;
    MAX_WIDTH = CONFIG.screen_x;
    MIN_HEIGHT = 48;
    MAX_HEIGHT = CONFIG.screen_y - 15;

    static content_offset: Point = [2, 12];

    static windows: { [key: string]: Window } = {};

    key: string;

    minimised = false;

    buttons: Clickable[] = [];

    content: Renderable;

    raster: Raster;

    color_background = Color.GREY;
    color_highlight = Color.SILVER;
    color_text = Color.WHITE;

    constructor(
        public name: string,
        public icon: Raster,
        protected position?: Point,
        protected width?: number,
        protected height?: number,
    ) {
        this.auto_size(position, width, height);
    }

    static register(key: string, window: Window) {
        if (Window.windows[key]) {
            window = Window.windows[key];
        } else {
            Window.windows[key] = window;
        }
        window.key = key;
        window.minimised = false;
        OS.open_window(window);
        return window;
    }

    set_name(name: string) {
        this.name = name;
    }

    resize_left(move: Point) {
        const new_x = MathPlus.clamp(
            Math.max(0, this.position[0] + this.width - this.MAX_WIDTH),
            this.position[0] + move[0],
            this.position[0] + this.width - this.MIN_WIDTH
        );
        this.width += this.position[0] - new_x;
        this.position[0] = new_x;
    }

    resize_right(move: Point) {
        this.width = MathPlus.clamp(
            this.MIN_WIDTH,
            this.width + move[0],
            Math.min(this.MAX_WIDTH, CONFIG.screen_x - this.position[0])
        );
    }

    resize_top(move: Point) {
        const new_y = MathPlus.clamp(
            Math.max(16, this.position[1] + this.height - this.MAX_HEIGHT),
            this.position[1] + move[1],
            this.position[1] + this.height - this.MIN_HEIGHT
        );
        this.height += this.position[1] - new_y;
        this.position[1] = new_y;
    }

    resize_bottom(move: Point) {
        this.height = MathPlus.clamp(
            this.MIN_HEIGHT,
            this.height + move[1],
            Math.min(this.MAX_HEIGHT, CONFIG.screen_y - this.position[1] + 1)
        );
    }

    resize() {
        let top = 2;
        let right = this.width;

        ([
            [Clickable.BUTTON_CLOSE, () => OS.close_window(this)],
            [Clickable.BUTTON_MINIMISE, () => this.minimised = true],
            [Clickable.BUTTON_EXPAND, () => this.expand()],
        ] as [Button, () => void][]).forEach(([button, on_click], i) => {
            right -= button.default.width + 2;
            if (this.buttons[i]) {
                this.buttons[i].resize([right, top]);
            } else {
                this.buttons[i] = Clickable.button(button, [right, top], on_click);
            }
        });
        right -= 2;

        ([
            [[[2, 2], right, Window.content_offset[1] - 2], ({move}) => {
                this.position[0] = MathPlus.clamp(0, this.position[0] + move[0], CONFIG.screen_x - this.width);
                this.position[1] = MathPlus.clamp(16, this.position[1] + move[1], CONFIG.screen_y - this.height + 1);
            }],
            [[[0, 0], 2, 2], ({move}) => {
                this.resize_top(move);
                this.resize_left(move);
                this.resize();
            }],
            [[[2, 0], this.width - 4, 2], ({move}) => {
                this.resize_top(move);
                this.resize();
            }],
            [[[this.width - 2, 0], 2, 2], ({move}) => {
                this.resize_top(move);
                this.resize_right(move);
                this.resize();
            }],
            [[[0, 2], 2, this.height - 5], ({move}) => {
                this.resize_left(move);
                this.resize();
            }],
            [[[this.width - 2, 2], 2, this.height - 5], ({move}) => {
                this.resize_right(move);
                this.resize();
            }],
            [[[0, this.height - 3], 2, 2], ({move}) => {
                this.resize_bottom(move);
                this.resize_left(move);
                this.resize();
            }],
            [[[2, this.height - 3], this.width - 4, 2], ({move}) => {
                this.resize_bottom(move);
                this.resize();
            }],
            [[[this.width - 2, this.height - 3], 2, 2], ({move}) => {
                this.resize_bottom(move);
                this.resize_right(move);
                this.resize();
            }],
        ] as [[Point, number, number], ({}: {move: Point}) => void][]).forEach(([dimensions, move], i) => {
            let button = this.buttons[i + 3]
            if (button) {
                button.resize(...dimensions);
            } else {
                button = this.buttons[i + 3] = new Clickable(...dimensions);
                button.on_drag(move);
            }
        });

        this.raster = new Raster(this.width, this.height);
    }

    auto_size(
        position: Point = [CONFIG.screen_x / 4, CONFIG.screen_y / 4],
        width = CONFIG.screen_x / 2,
        height = CONFIG.screen_y / 2
    ) {
        width = MathPlus.clamp(this.MIN_WIDTH, width, this.MAX_WIDTH);
        height = MathPlus.clamp(this.MIN_HEIGHT, height, this.MAX_HEIGHT);
        position[0] = MathPlus.clamp(0, position[0], CONFIG.screen_x - width);
        position[1] = MathPlus.clamp(0, position[1], CONFIG.screen_y - height);
        this.position = position;
        this.width = width;
        this.height = height;
        this.resize();
    }

    expand() {
        if (this.width >= this.MAX_WIDTH &&
            this.height >= this.MAX_HEIGHT
        ) {
            this.auto_size();
        } else {
            this.position = [0, 16];
            this.width = this.MAX_WIDTH;
            this.height = this.MAX_HEIGHT;
            this.resize();
        }
    }

    update(input: iInput) {
        if (this.minimised) return;

        const {cursor} = input;

        Cursor.shift(input, this.position, () => {
           this.buttons.forEach(button => button.update(input));
           Cursor.shift(input, Window.content_offset, () => this.update_content(input));
        });

        input.handled ||= !this.minimised &&
            this.position[0] <= cursor.position[0] &&
            cursor.position[0] < this.position[0] + this.width &&
            this.position[1] <= cursor.position[1] &&
            cursor.position[1] < this.position[1] + this.height;
    }

    update_content(input: iInput) {
        this.content?.update(input);
    }

    render(raster: Raster) {
        if (this.minimised) return;
        this.raster.fill(this.color_background);
        this.raster.line([0, 0], [this.width, 0], this.color_highlight);
        this.buttons.forEach(button => button.render(this.raster));
        const text_area = new Raster(this.width - 32, Window.content_offset[1]);
        this.raster.stamp(text_area.fit_text(this.name, this.color_text), [4, 4]);
        const content_raster = new Raster(
            this.width - Window.content_offset[0] - 2,
            this.height - Window.content_offset[1] - 3,
        );
        this.render_content(content_raster);
        this.raster.stamp(content_raster, Window.content_offset);
        this.raster.line([0, this.height - 1], [this.width, this.height - 1], Color.BLACK);
        raster.stamp(this.raster, this.position);
    }

    render_content(raster: Raster) {
        this.content?.render(raster);
    }
}