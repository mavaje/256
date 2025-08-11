export type EventUp = {
    'client-id': (id: string) => void;
};

export type EventDown = {
    'palette': (palette: string[]) => void,
    'display': (buffer: ArrayBufferLike) => void,
};
