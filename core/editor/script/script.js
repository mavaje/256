"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Script = void 0;
const tab_1 = require("../tab");
class Script extends tab_1.Tab {
    icon = 10;
    text = '';
    render(raster) {
        raster.cursor = [1, 1];
        for (let c = 0; c < 256; c++) {
            raster.print(c);
            if (c % 16 === 15)
                raster.print(255);
        }
    }
    handle_event(event) {
        if (super.handle_event(event))
            return true;
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
exports.Script = Script;
