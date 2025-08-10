import {Raster} from "./raster";
import {iInput} from "../../api/input";

export interface Renderable {
    update(input?: iInput): void;
    render(raster: Raster): void;
}