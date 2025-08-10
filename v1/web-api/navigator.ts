import {BatteryManager} from "./battery-manager";
import {NetworkInformation} from "./network-information";

export interface NavigatorPlus extends Navigator {

    connection: NetworkInformation;

    getBattery(): Promise<BatteryManager>;
}