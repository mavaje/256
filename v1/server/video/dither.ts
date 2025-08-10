import {iPalette, RGB} from "../../api/palette";
import {MathPlus} from "../../util/math-plus";

type OverflowMap = {
    dM: number;
    dm: number;
    weight: number;
}[]

export class Dither {

    static instance: Dither;

    static OVERFLOW_MAP_FLOYD_STEINBERG: OverflowMap = [
        {dm: 1, dM: 0, weight: 7 / 16},
        {dm: -1, dM: 1, weight: 3 / 16},
        {dm: 0, dM: 1, weight: 5 / 16},
        {dm: 1, dM: 1, weight: 1 / 16},
    ];

    overflow_map = Dither.OVERFLOW_MAP_FLOYD_STEINBERG;

    overflow: RGB[][];

    public palette: iPalette;

    static get_instance() {
        return Dither.instance ?? (Dither.instance = new Dither());
    }

    static reset(palette: iPalette) {
        const dither = this.get_instance();
        dither.palette = palette;
        dither.overflow = [];
    }

    static get_nearest(color: RGB, major?: number, minor?: number) {
        return this.get_instance().get_nearest(color, major, minor);
    }

    private get_nearest(color: RGB, major?: number, minor?: number) {
        const overflow = this.overflow[major]?.[minor];
        if (overflow) color = color.map((x, i) => x + overflow[i]);

        const nearest = this.palette.reduce((n, c, i) => {
            const d = this.distance(color, c);
            return !n || d < n.distance ? {
                color: c,
                index: i,
                distance: d,
            } : n;
        }, null as {color: RGB, index: number, distance: number});

        if (major > -1 && minor > -1) {
            const diff: RGB = color.map((x, i) => x - nearest.color[i]);
            this.overflow_map.forEach(({dM, dm, weight}) => {
                const M = major + dM;
                const m = minor + dm;
                if (!this.overflow[M]) this.overflow[M] = [];
                if (!this.overflow[M][m]) this.overflow[M][m] = [0, 0, 0];
                diff.forEach((d, i) => {
                    this.overflow[M][m][i] += d * weight;
                });
            });
        }

        return nearest.index;
    }

    private distance(color1: RGB, color2: RGB): number {
        return this.distance_redmean(color1, color2);
    }

    private distance_euclidean(color1: RGB, color2: RGB): number {
        const dr = color1[0] - color2[0];
        const dg = color1[1] - color2[1];
        const db = color1[2] - color2[2];
        return dr ** 2 + dg ** 2 + db ** 2;
    }

    private distance_redmean(color1: RGB, color2: RGB): number {
        const dr = color1[0] - color2[0];
        const dg = color1[1] - color2[1];
        const db = color1[2] - color2[2];
        const mr = MathPlus.clamp(0, (color1[0] + color1[1]) / 2, 255);
        return Math.sqrt(
            (dr ** 2) * (2 + mr / 256) +
               (dg ** 2) * 4 +
               (db ** 2) * (2 + (255 - mr) / 256));
    }
}