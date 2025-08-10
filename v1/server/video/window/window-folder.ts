import {Window} from "./window";
import {Folder} from "../../fs/folder";
import {FS} from "../../fs/fs";
import {Renderable} from "../renderable";
import {Raster} from "../raster";
import {Clickable} from "../clickable";
import {Color} from "../palette";
import {iInput} from "../../../api/input";

export class FolderContent implements Renderable {

    static BG_HOVER = Color.NAVY;
    static BG_PRESS = Color.BLUE;

    icons: Clickable[] = [];

    constructor(private folder: Folder) {
        this.update_icons();
    }

    create_icon(name: string, icon: Raster, on_click: () => void) {
        const button = new Clickable(
            [0, 0],
            32, 32,
            (raster, {hovered, pressed}) => {
                raster.clear();
                if (pressed) {
                    raster.fill(FolderContent.BG_PRESS);
                } else if (hovered) {
                    raster.fill(FolderContent.BG_HOVER);
                }

                const icon_raster = new Raster(16, 16, icon.mask);
                icon_raster.contain(icon);
                raster.stamp(icon_raster, [8, 0]);

                const text_area = new Raster(30, 16, 2);
                const text = text_area.fit_text(name);
                text_area.center(text);
                raster.stamp(text_area, [1, 17], undefined, {[Color.WHITE]: Color.BLACK});
                raster.stamp(text_area, [1, 16]);
            },
            Color.BLACK,
        );
        button.on_click(on_click);
        return button;
    }

    update_icons() {
        this.icons = [];
        if (this.folder.parent) {
            this.icons.push(this.create_icon(this.folder.parent.name, FS.FOLDER_UP, () => this.folder.parent.launch()));
        }
        Object.entries(this.folder.items)
            .sort(([a], [b]) => a < b ? -1 : 1)
            .forEach(([_, item]) => {
                this.icons.push(this.create_icon(item.name, item.icon, () => item.launch()));
            });
    }

    update(input: iInput) {
        this.icons.forEach(icon => icon.update(input));
    }

    render(raster: Raster) {
        let x = 0, y = 0;
        this.icons.forEach(button => {
            if (button) {
                button.resize([x, y]);
                button.render(raster);

                x += 32;
                if (x > 0 && x + 32 > raster.width) {
                    x = 0;
                    y += 32;
                }
            }
        });
    }
}

export class FolderWindow extends Window {

    color_background = Color.GOLD;
    color_highlight = Color.YELLOW;
    color_text = Color.BROWN;

    constructor() {
        super('files', FS.FOLDER);
    }

    static open(folder: Folder) {
        const window = super.register('files', new FolderWindow());
        window.content = new FolderContent(folder);
        window.set_name(folder.name);
    }

    set_name(name: string) {
        super.set_name(name + ' - files');
    }
}