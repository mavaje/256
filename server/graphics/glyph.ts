import {Sprite} from "./sprite";

export class Glyph extends Sprite {

    constructor(
        width: number,
        height: number,
        public baseline: number,
        bitmap?: ArrayLike<number>,
    ) {
        super(width, height, bitmap);
    }
}
