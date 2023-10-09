import {Raster} from "./raster";

export interface Renderable {
    render(raster: Raster): void;
}