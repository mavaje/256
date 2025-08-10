import {iRaster} from "./raster";
import {iPalette} from "./palette";
import {iCursor} from "./input";

export interface iOutput {
    palette: iPalette;
    raster: iRaster;
    cursor: iCursor;
}