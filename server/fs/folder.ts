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

            const icon = new Raster(16, 16, FS.MASK);
            icon.contain(item.icon);
            raster.stamp(icon, [x + 8, y]);

            const text_area = new Raster(30, 14, 2);
            const text = text_area.fit_text(item.name);
            text_area.center(text);

            raster.stamp(text_area, [x + 1, y + 18], 1, {[Color.WHITE]: Color.BLACK});
            raster.stamp(text_area, [x + 1, y + 17]);

            x += 32;
            if (x > 0 && x + 32 > raster.width) {
                x = 0;
                y += 32;
            }
        });
    }
}