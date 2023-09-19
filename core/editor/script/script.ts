import {Tab} from "../tab";
import {Event} from "../../control/event";
import {Raster} from "../../video/raster";

export class Script extends Tab {

    icon = 10;

    text = '';

    render(raster: Raster) {
        raster.cursor = [1, 1];
        for (let c = 0; c < 256; c++) {
            raster.print(c);
            if (c % 16 === 15) raster.print(255);
        }
    }

    handle_event(event: Event) {
        if (super.handle_event(event)) return true;
        switch (event.type) {
            case 'cursor-move':
                break;
            case 'cursor-press':
                break;
            case 'cursor-release':
                break;
            case 'key-press':
                break;
            case 'key-release':
                break;
        }
        return false;
    }

}
