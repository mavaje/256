import {Point, Raster} from "./raster";
import {Renderable} from "./renderable";
import {Color} from "./palette";
import {NavigatorPlus} from "../../web-api/navigator";
import {BatteryManager} from "../../web-api/battery-manager";
import {Font} from "./font";
import {NetworkInformation} from "../../web-api/network-information";
import {CONFIG} from "../../config";
import {OS} from "../os";
import {Clickable} from "./clickable";
import {iInput} from "../../api/input";

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

    buttons: { [key: string]: Clickable } = {};

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

    update(input: iInput) {
        const now = new Date();
        const [hh, mm, ss] = [
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
        ].map(n => n.toString().padStart(2, '0'));
        this.time = `${hh}:${mm}:${ss}`;

        this.network = (navigator as NavigatorPlus).connection;

        let position = 0;
        this.buttons = Object.fromEntries(OS.windows().map(window => {
            let button = this.buttons[window.key];
            if (!button) {
                button = new Clickable(
                    [16 * position++, 0],
                    16, 16,
                    (raster, {hovered, pressed}) => {
                        raster.clear();
                        if (pressed) {
                            raster.fill(Color.BLUE);
                        } else if (hovered) {
                            raster.fill(Color.NAVY);
                        }
                        raster.center(window.icon);
                    },
                    Color.BLACK,
                );
                button.on_click(() => OS.toggle_window(window));
            } else {
                button.resize([16 * position++, 0]);
            }
            button.update(input);
            return [window.key, button];
        }));
    }

    render(raster: Raster) {
        raster.rect([0, 0], CONFIG.screen_x, 16, Color.BLACK);
        raster.font = Font.SANS;

        Object.values(this.buttons).forEach(button => {
            button.render(raster);
        });

        const corner: Point = [CONFIG.screen_x - 1, 1];

        if (this.time) {
            corner[0] -= raster.text_width(this.time);
            raster.print(this.time, corner, Color.WHITE);
            corner[0] = CONFIG.screen_x - 1;
            corner[1] += raster.text_height(this.time) + 1;
        }

        if (this.battery) {
            const battery_icon = this.battery.charging ? Toolbar.ICON_BATTERY_CHARGING : Toolbar.ICON_BATTERY;
            const battery_level = Math.ceil(this.battery.level * battery_icon.width);
            const color = {
                [1]: Color.RED,
                [2]: Color.ORANGE,
                [3]: Color.YELLOW,
            }[battery_level] || Color.WHITE;

            corner[0] -= battery_icon.width + 3;
            raster.stamp(battery_icon, corner, 1, n => battery_level < n ? Color.GREY : color,);
        }

        const network_level = {
            'slow-2g': 1,
            '2g': 1,
            '3g': 2,
            '4g': 3,
            '5g': 3,
        }[this.network?.effectiveType] ?? 0;
        if (network_level > 0) {
            const color = {
                [1]: Color.RED,
                [2]: Color.YELLOW,
            }[network_level] || Color.WHITE;
            corner[0] -= Toolbar.ICON_WIFI.width + 3;
            raster.stamp(Toolbar.ICON_WIFI, corner, 1, n => network_level < n ? Color.GREY : color);
        } else {
            corner[0] -= Toolbar.ICON_WIFI_OFF.width + 3;
            raster.stamp(Toolbar.ICON_WIFI_OFF, corner);
        }

    }
}