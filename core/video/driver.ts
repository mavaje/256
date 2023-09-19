import {Raster} from "./raster";
import {Palette} from "./palette";

export interface Driver {

    render(raster: Raster, palette?: Palette): void;

}
