
export enum KeyboardKeys {
    NEW_LINE = 0x0A,
}

export interface iKeyInput {
    keys: {
        [key: number]: boolean;
    };
}

export type PlayerInputMap = { [player: number]: iKeyInput };

export interface iCursor {
    position: [number, number];
    pressed: boolean;
}

export interface iInput {
    keyboard?: iKeyInput;
    players: PlayerInputMap;
    cursor?: iCursor;
}