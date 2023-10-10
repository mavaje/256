import {File} from "./file";
import {FS} from "./fs";
import {Color} from "../video/palette";

export class TextFile extends File {

    constructor(name?: string, private content?: string) {
        super(name);
        this.icon = FS.FILE_TEXT.clone();
        this.update_content(content);
    }

    update_content(content: string) {
        this.content = content;
        const mask = Color.RED;
        const page_color = Color.SILVER;
        const text_color = Color.GREY;
        const lines = content?.split('\n') ?? [];
        let l = 0;
        let c = 0;
        let next_l = 0;
        for (let y = 0; y < this.icon.height; y++) {
            for (let x = 0; x < this.icon.width; x++) {
                if (this.icon.pixel_at([x, y]) === mask) {
                    const color = /[^ ]/.test(lines[l]?.[c] || ' ') ? text_color : page_color;
                    this.icon.pixel([x, y], color);
                    next_l = l + 1;
                    c++;
                }
            }
            l = next_l;
            c = 0;
        }
    }
}