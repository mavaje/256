import {Event} from "./event";

export interface Controller {

    initialise(handle: (event: Event) => boolean): void;

}
