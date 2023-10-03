import {Point, Raster} from "./raster";

export abstract class Window {

    name: string;
    position: Point;
    raster: Raster;

    render() {

    }

}