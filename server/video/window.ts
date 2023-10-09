import {Point, Raster} from "./raster";
import {Renderable} from "./renderable";

export abstract class Window implements Renderable {

    name: string;
    position: Point;
    raster: Raster;

    render() {}
}