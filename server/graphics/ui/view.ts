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

    }

    render(sprite: Sprite): void {

        this.children.forEach(child => {
            child.render(this);
        });

        sprite.stamp(this, this.x, this.y);
    }
}

export function view(
    x: number,
    y: number,
    width: number,
    height: number,
): View {
    return new View(x, y, width, height);
}
