import {iInput} from "./input";
import {iOutput} from "./output";

export interface iClient {
    receive(output: iOutput): iInput;
}