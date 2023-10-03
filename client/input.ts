import {iInput} from "../api/input";
import {iCursor} from "../api/cursor";

export class Input implements iInput {

    constructor(
        public player: number = 0,
        public buttons: number[] = [],
        public cursor: iCursor = {position: [0, 0]}
    ) {}

    input_active(input: number) {
        this.buttons[input] = input;
    }

    input_inactive(input: number) {
        delete this.buttons[input];
    }
}