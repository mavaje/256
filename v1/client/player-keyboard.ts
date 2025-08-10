import {iKeyInput} from "../api/input";
import {KeyInput} from "./key-input";

export class PlayerKeyboardInput extends KeyInput implements iKeyInput {

    static KEY_MAP = {
        'ArrowUp': 0x01,
    };

    key_map(key: string): number {
        return PlayerKeyboardInput.KEY_MAP[key];
    }
}