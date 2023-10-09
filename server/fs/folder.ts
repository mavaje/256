import {FSItem} from "./fs-Item";
import {Point, Raster} from "../video/raster";
import {FS} from "./fs";
import {iInput} from "../../api/input";
import {CONFIG} from "../../config";
import {Color} from "../video/palette";

export class Folder extends FSItem {

    items: {
        [name: string]: FSItem;
    } = {};

    meta: {
        [name: string]: {
            position?: Point;
            highlight?: boolean;
        }
    } = {};

    constructor(name?: string) {
        super(name);
        this.icon = FS.FOLDER;
    }


    add_item(item: FSItem) {
        this.items[item.name] = item;
        this.meta[item.name] = {};
    }

    update(input: iInput) {
        const {cursor} = input;
        Object.values(this.meta).forEach(meta => {
            meta.highlight = meta.position &&
                meta.position[0] <= cursor.position[0] && cursor.position[0] < meta.position[0] + 32 &&
                meta.position[1] <= cursor.position[1] && cursor.position[1] < meta.position[1] + 32;
        })
    }

    render(raster: Raster) {
        let x = 0, y = 0;
        Object.keys(this.items).sort().forEach(name => {
            const item = this.items[name];
            const meta = this.meta[name];
            meta.position = [x, y];

            if (meta.highlight) {
                raster.square([x, y], 32, Color.NAVY);
            }

            const icon = new Raster(16, 16, 0);
            icon.contain(item.icon);
            raster.stamp(icon, [x + 8, y]);

            const trimmed = item.name.trim();
            let line_1 = trimmed;
            let i = line_1.length;
            while (raster.text_width(line_1) > 30) {
                i--;
                line_1 = trimmed.slice(0, i).trim();
            }

            let line_2 = trimmed.slice(i).trim();
            let j = i + line_2.length;
            while (raster.text_width(line_2) > 30) {
                j--;
                line_2 = trimmed.slice(i, j).trim() + '...';
            }

            const name_fit = line_1 + '\n' + line_2;

            const offset = (32 - raster.text_width(name_fit)) / 2;
            raster.print(name_fit, [x + offset, y + 17]);

            x += 32;
            if (x > 0 && x + 32 > raster.width) {
                x = 0;
                y += 32;
            }
        });
    }
}