import {Raster} from "../raster";

export abstract class Wallpaper {

    abstract update(): void;
    abstract render(raster: Raster): void;
}