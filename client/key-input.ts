import {iKeyInput} from "../api/input";

export abstract class KeyInput implements iKeyInput {

    private key_data: {
        [code: number]: {
            count: number;
            key: string;
            persist: boolean;
        };
    } = {};

    keys = {};

    abstract key_map(key: string): number;

    start_listeners() {
        document.addEventListener('keydown', this.set_state.bind(this, true));
        document.addEventListener('keyup', this.set_state.bind(this, false));
    }

    set_state(state: boolean, event: KeyboardEvent) {
        event.preventDefault();
        console.log(event);
        const {key, code, repeat, shiftKey} = event;
        const data = this.key_data[code] ||= {count: 0};
        data.key = key;
        if (!repeat) {
            data.count = state ? 1 : 0;
            // data.count += state ? 1 : -1;
            if (state) data.persist = true;
        }
        this.update_keys();
    }

    reset_persist() {
        Object.values(this.key_data)
            .forEach(data => data.persist = false);
        this.update_keys();
    }

    update_keys() {
        this.keys = {};
        Object.values(this.key_data).forEach(data => {
            if (data.persist || data.count > 0) {
                this.keys[this.key_map(data.key)] = true;
            }
        });
    }
}