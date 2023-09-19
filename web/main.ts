import {Main} from "../core/main";
import {WebDriver} from "./video/driver";
import {WebController} from "./control/controller";

export class WebMain extends Main {

    constructor(canvas: HTMLCanvasElement) {
        super(
            new WebDriver(canvas),
            new WebController(canvas)
        );
    }

}
