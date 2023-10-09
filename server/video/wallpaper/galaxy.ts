import {Wallpaper} from "./wallpaper";
import {Raster} from "../raster";
import {Color} from "../palette";

class Star {

    angle: number;
    velocity: number;
    distance: number;

    x: number;
    y: number;
    size: number;
    color = Color.WHITE;

    constructor(rainbow = false) {
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = 1.025 + Math.random() * 0.05;
        this.distance = 10 + Math.random();
        if (rainbow) this.color = Math.floor(Math.random() * 16);
    }

    update() {
        this.distance *= this.velocity;
        this.size = this.distance * (this.velocity - 1) / 2;
        this.x = 128 + this.distance * Math.sin(this.angle) - this.size / 2;
        this.y = 128 + this.distance * Math.cos(this.angle) - this.size / 2;
    }

    render(raster: Raster) {
        raster.circle([this.x, this.y], this.size+1, this.color);
    }
}

export class Galaxy extends Wallpaper {

    stars: Star[] = [];

    update() {
        this.stars.forEach(star => star.update());
        this.stars.push(new Star());
    }

    render(raster: Raster) {
        raster.fill(Color.BLACK);
        this.stars.forEach(star => star.render(raster));
        this.stars = this.stars.filter(star => star.distance < 256);
    }
}