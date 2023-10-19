import {Window} from "./window";
import {FS} from "../../fs/fs";
import {Color, Palette} from "../palette";
import {PaletteFile} from "../../fs/file-palette";
import {Raster} from "../raster";
import {Clickable} from "../clickable";
import {iInput} from "../../../api/input";
import {Dither} from "../dither";
import {RGB} from "../../../api/palette";
import {MathPlus} from "../../../util/math-plus";
import {Font} from "../font";

type ColorSpace = 'rgb' | 'hsv';

export class PaletteWindow extends Window {

    static COLOR_SPACES: {
        [key: string]: {
            from_rgb: (rgb: RGB) => RGB;
            to_rgb: (values: RGB) => RGB;
        }
    } = {
        rgb: {
            from_rgb: rgb => [...rgb],
            to_rgb: values => [...values],
        },
        hsv: {
            from_rgb: rgb => Palette.rgb_to_hsv(rgb),
            to_rgb: Palette.hsv_to_rgb,
        }
    }

    static SLIDERS: {
        name: string;
        type: ColorSpace;
        index: number;
        scale: number;
    }[] = [
        {
            name: 'R',
            type: 'rgb',
            index: 0,
            scale: 255,
        },
        {
            name: 'G',
            type: 'rgb',
            index: 1,
            scale: 255,
        },
        {
            name: 'B',
            type: 'rgb',
            index: 2,
            scale: 255,
        },
        {
            name: 'H',
            type: 'hsv',
            index: 0,
            scale: 6,
        },
        {
            name: 'S',
            type: 'hsv',
            index: 1,
            scale: 1,
        },
        {
            name: 'V',
            type: 'hsv',
            index: 2,
            scale: 1,
        },
    ];

    MIN_WIDTH = 8 * 16 + 6;
    MAX_WIDTH = 8 * 16 + 6;
    // MIN_HEIGHT = 125;
    // MAX_HEIGHT = 125;

    color_background = Color.BROWN;
    color_highlight = Color.RED;
    color_text = Color.PINK;

    palette: Palette;

    color_buttons: Clickable[] = [];

    sliders: Clickable[] = [];
    manual_slider?: {
        type: ColorSpace;
        values: number[];
    } = null;

    active_color = Color.BLACK;

    constructor() {
        super('Palette', FS.FILE_PALETTE);
        this.auto_size();
        this.create_buttons();
    }

    static open(palette_file: PaletteFile) {
        const window = super.register('palette', new PaletteWindow()) as PaletteWindow;
        window.name = palette_file.name;
        window.palette = palette_file.palette;
    }

    create_buttons() {
        for (let i = 0; i < 16; i++) {
            const button = new Clickable(
                [i * 8 + 1, 1],
                8, 8,
                raster => raster.fill(i),
                undefined,
                [i]
            );
            button.on_click(() => {
                this.active_color = i;
                this.manual_slider = null;
                this.sliders.forEach(slider => slider.particle_colors = [i]);
            });
            this.color_buttons.push(button);
        }

        PaletteWindow.SLIDERS.forEach(({type, index, scale}, i) => {
            const w = this.width - 12;
            const h = 8;
            const color_space = PaletteWindow.COLOR_SPACES[type];
            const slider = new Clickable(
                [7, 11 + 10 * i],
                w, h,
                raster => {
                    Dither.reset(this.palette);
                    const values = [...type === this.manual_slider?.type ?
                        this.manual_slider.values :
                        color_space.from_rgb(this.palette[this.active_color])];
                    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
                        values[index] = scale * (x - 4) / (w - 8);
                        const rgb = color_space.to_rgb(values);
                        raster.pixel([x, y], Dither.get_nearest(rgb, x, y));
                    }
                },
                undefined,
                [this.active_color],
            );
            slider.on_drag(({position: [x]}) => {
                const values =  type === this.manual_slider?.type ?
                    this.manual_slider.values :
                    color_space.from_rgb(this.palette[this.active_color]);
                if (type !== this.manual_slider?.type) this.manual_slider = {type, values};
                values[index] = scale * MathPlus.clamp(0, (x - 4) / (w - 8), 1);
                this.palette.update_color(this.active_color, color_space.to_rgb(values));
            });
            this.sliders[i] = slider;
        });
    }

    update_content(input: iInput) {
        super.update_content(input);
        this.color_buttons.forEach(button => button.update(input));
        this.sliders.forEach(slider => slider.update(input));
    }

    render_content(raster: Raster) {
        raster.fill(this.color_background);
        this.color_buttons.forEach(button => button.render(raster));
        raster.square([8 * this.active_color + 1, 1], 9, null, Color.BLACK);
        raster.square([8 * this.active_color, 0], 9, null, Color.WHITE);
        this.sliders.forEach(slider => slider.render(raster));
        const rgb = this.palette?.[this.active_color];
        if (rgb) PaletteWindow.SLIDERS.forEach(({name, type, index, scale}, i) => {
            const color_space = PaletteWindow.COLOR_SPACES[type];
            const values = type === this.manual_slider?.type ?
                this.manual_slider.values :
                color_space.from_rgb(rgb);
            const v = values[index] / scale;
            raster.print(name, [0, 12 + 10 * i], Color.WHITE, Font.MONO);
            raster.square([(this.width - 20) * v + 7, 11 + 10 * i], 9, this.active_color, Color.BLACK);
            raster.square([(this.width - 20) * v + 6, 10 + 10 * i], 9, null, Color.WHITE);
        });

        [
            {
                rgb: (a, b) => [a, b, 0],
                offset: [0, 0],
            },
            {
                rgb: (a, b) => [a, 0, b],
                offset: [1, 0],
            },
            {
                rgb: (a, b) => [0, a, b],
                offset: [2, 0],
            },
            {
                rgb: (a, b) => [a, b, b],
                offset: [0, 1],
            },
            {
                rgb: (a, b) => [a, a, b],
                offset: [1, 1],
            },
            {
                rgb: (a, b) => [a, b, a],
                offset: [2, 1],
            },
            {
                rgb: (a, b) => [a, b, 255],
                offset: [0, 2],
            },
            {
                rgb: (a, b) => [a, 255, b],
                offset: [1, 2],
            },
            {
                rgb: (a, b) => [255, a, b],
                offset: [2, 2],
            },
        ].forEach(({rgb, offset}) => {
            Dither.reset(this.palette);
            for (let x = 0; x < 32; x++) for (let y = 0; y < 32; y++) {
                raster.pixel([offset[0] * 32 + x + 1, offset[1] * 32 + y + 71], Dither.get_nearest(rgb(x * 8, y * 8), x, y));
            }
        })
    }
}