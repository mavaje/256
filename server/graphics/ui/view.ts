import {Sprite} from "../sprite";
import {Client} from "../../client";

export class View extends Sprite {

    parent?: View = null;
    children: View[] = [];

    constructor(
        public x: number,
        public y: number,
        width: number,
        height: number,
    ) {
        super(width, height);
    }

    append(child: View): this;
    append(...children: View[]): this;
    append(...children: View[]) {
        children.forEach(child => {
            this.children.push(child);
            child.parent = this;
        });
        return this;
    }

    on_hover(listener: (x: number, y: number, client: Client) => void) {
        for (const child of this.children) {

        }
    }

    render(
        sprite: Sprite,
        parent_x: number,
        parent_y: number,
    ) {
        this.children.forEach(child => {
            child.render(
                sprite,
                parent_x + this.x,
                parent_y + this.y,
            );
        });

        if (sprite !== this) {
            sprite?.stamp(
                this,
                parent_x + this.x,
                parent_y + this.y,
            );
        }

        this.previous_point = [0, 0];
        this.previous_print = [1, 1];
    }
}
