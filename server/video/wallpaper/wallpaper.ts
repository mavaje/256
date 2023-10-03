import {Raster} from "../raster";

export abstract class Wallpaper {

    raster: Raster = new Raster(256, 256);

    abstract update(): void;
    abstract render(): void;
}