import {FSItem} from "./fs-Item";
import {FS} from "./fs";
import {FolderWindow} from "../video/window/window-folder";

export class Folder extends FSItem {

    items: {
        [name: string]: FSItem;
    } = {};

    constructor(name?: string) {
        super(name);
        this.icon = FS.FOLDER;
    }

    launch() {
        FolderWindow.open(this);
    }

    add_item(item: FSItem) {
        this.items[item.name] = item;
        item.parent = this;
    }
}