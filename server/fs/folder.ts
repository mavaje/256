import {FSItem} from "./fs-Item";

export class Folder extends FSItem {

    items: {
        [name: string]: FSItem;
    };

    get_items() {
        return Object.values(this.items).sort((a, b) => a.name < b.name ? -1 : 1);
    }
}