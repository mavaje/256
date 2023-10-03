import {Wallpaper} from "./wallpaper";
import {Raster} from "../raster";
import {Colour} from "../palette";

class Star {

    angle: number;
    velocity: number;
    distance: number;

    x: number;
    y: number;
    size: number;
    color = Colour.WHITE;

    constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = 1.025 + Math.random() * 0.05;
        this.distance = 10 + Math.random();
        if (Math.random() < 0.1) {
            this.color = [
                Colour.RED,
                Colour.ORANGE,
                Colour.YELLOW,
                Colour.LIME,
                Colour.CYAN,
                Colour.BLUE,
                Colour.PINK,
            ][Math.floor(Math.random() * 7)];
        }
    }

    update() {
        this.distance *= this.velocity;
        this.size = this.distance * (this.velocity - 1) / 2;
        this.x = 128 + this.distance * Math.sin(this.angle) - this.size / 2;
        this.y = 128 + this.distance * Math.cos(this.angle) - this.size / 2;
    }

    render(raster: Raster) {
        raster.circle([this.x, this.y], this.size, this.color);
    }
}

export class Galaxy extends Wallpaper {

    stars: Star[] = [];

    update() {
        this.stars.forEach(star => star.update());
        this.stars.push(new Star());
    }

    render() {
        this.raster.fill(Colour.BLACK);
        this.stars.forEach(star => star.render(this.raster));
        this.stars = this.stars.filter(star => star.distance < 256);
    }
}