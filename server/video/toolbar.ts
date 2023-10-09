import {Raster} from "./raster";
import {Renderable} from "./renderable";
import {Color} from "./palette";
import {NavigatorPlus} from "../../web-api/navigator";
import {BatteryManager} from "../../web-api/battery-manager";
import {Font} from "./font";
import {NetworkInformation} from "../../web-api/network-information";
import * as net from "net";
import {CONFIG} from "../../config";

export class Toolbar implements Renderable {

    static ICON_KEYBOARD: Raster;
    static ICON_GAMEPAD: Raster;
    static ICON_WIFI: Raster;
    static ICON_WIFI_OFF: Raster;
    static ICON_BATTERY: Raster;
    static ICON_BATTERY_CHARGING: Raster;

    time = '00:00:00';
    battery: BatteryManager = null;
    network: NetworkInformation = null;

    constructor() {
        (navigator as NavigatorPlus)
            .getBattery()
            .then(battery => this.battery = battery);
    }

    static async load() {
        Toolbar.ICON_KEYBOARD = await Toolbar.load_icon('keyboard');
        Toolbar.ICON_GAMEPAD = await Toolbar.load_icon('gamepad');

        Toolbar.ICON_BATTERY = await Toolbar.load_icon('battery');
        Toolbar.ICON_BATTERY_CHARGING = await Toolbar.load_icon('battery-charging');

        Toolbar.ICON_WIFI = await Toolbar.load_icon('wifi');
        Toolbar.ICON_WIFI_OFF = await Toolbar.load_icon('wifi-off');
    }

    static async load_icon(icon: string): Promise<Raster> {
        return Raster.from_file(`toolbar/${icon}`, Color.BLACK);
    }

    update() {
        const now = new Date();
        const [hh, mm, ss] = [
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
        ].map(n => n.toString().padStart(2, '0'));
        this.time = `${hh}:${mm}:${ss}`;

        this.network = (navigator as NavigatorPlus).connection;
    }

    render(raster: Raster) {
        raster.rect([0, 0], CONFIG.screen_x, 7, Color.BLACK);
        raster.font = Font.SANS;

        let left = 1;

        raster.stamp(Toolbar.ICON_KEYBOARD, [left, 1]);
        left += Toolbar.ICON_KEYBOARD.width + 3;

        raster.stamp(Toolbar.ICON_GAMEPAD, [left, 1]);
        left += Toolbar.ICON_GAMEPAD.width + 3;

        let right = 255;

        if (this.time) {
            right -= raster.text_width(this.time);
            raster.print(this.time, [right, 1], Color.WHITE);
        }

        if (this.battery) {
            const battery_icon = this.battery.charging ? Toolbar.ICON_BATTERY_CHARGING : Toolbar.ICON_BATTERY;
            const battery_level = Math.ceil(this.battery.level * battery_icon.width);
            const color = {
                [1]: Color.RED,
                [2]: Color.ORANGE,
                [3]: Color.YELLOW,
            }[battery_level] || Color.WHITE;

            right -= battery_icon.width + 3;
            raster.stamp(battery_icon, [right, 1], 1, n => battery_level < n ? Color.GREY : color,);
        }

        const network_level = {
            'slow-2g': 1,
            '2g': 1,
            '3g': 2,
            '4g': 3,
            '5g': 3,
        }[this.network.effectiveType] ?? 0;
        if (network_level > 0) {
            const color = {
                [1]: Color.RED,
                [2]: Color.YELLOW,
            }[network_level] || Color.WHITE;
            right -= Toolbar.ICON_WIFI.width + 3;
            raster.stamp(Toolbar.ICON_WIFI, [right, 1], 1, n => network_level < n ? Color.GREY : color);
        } else {
            right -= Toolbar.ICON_WIFI_OFF.width + 3;
            raster.stamp(Toolbar.ICON_WIFI_OFF, [right, 1]);
        }

    }
}