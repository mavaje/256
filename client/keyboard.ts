import {iKeyInput} from "../api/input";
import {KeyInput} from "./key-input";

export class KeyboardInput extends KeyInput implements iKeyInput {

    static KEY_MAP = {
        'Enter': 0x0a,
        'Escape': 0x1B,
    };

    key_map(key: string): number {
        const code = key.length === 1 ? key.charCodeAt(0) : null;
        if (0x20 <= code && code <= 0x7E) return code;
        return KeyboardInput.KEY_MAP[key] ?? 0;
    }
}