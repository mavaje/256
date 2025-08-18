export type EventUp = {
    'client-id': (id: string) => void;
    'cursor-move': (x: number, y: number) => void;
    'cursor-down': (x: number, y: number) => void;
    'cursor-up': (x: number, y: number) => void;
    'key-down': (key: string) => void;
    'key-up': (key: string) => void;
    'button-down': (button: string, player: string) => void;
    'button-up': (button: string, player: string) => void;
};

export type EventDown = {
    'palette': (palette: string[]) => void,
    'display': (buffer: ArrayBuffer) => void,
};
