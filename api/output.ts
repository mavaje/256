import {iRaster} from "./raster";
import {iPalette} from "./palette";
import {iCursor} from "./cursor";

export interface iOutput {
    palette: iPalette;
    raster: iRaster;
    cursor: iCursor;
}