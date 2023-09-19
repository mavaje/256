"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
main_1.WebMain.ready().then(async () => {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    const main = new main_1.WebMain(canvas);
    main.start();
});
