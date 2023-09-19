"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebMain = void 0;
const main_1 = require("../core/main");
const driver_1 = require("./video/driver");
const controller_1 = require("./control/controller");
class WebMain extends main_1.Main {
    constructor(canvas) {
        super(new driver_1.WebDriver(canvas), new controller_1.WebController(canvas));
    }
}
exports.WebMain = WebMain;
