import {Point} from "../video/raster";

export type CursorEventType =
    'cursor-move' |
    'cursor-press' |
    'cursor-release';

export type KeyEventType =
    'key-press' |
    'key-release';

export type EventType = CursorEventType | KeyEventType;

export type Event = {
    type: EventType;
    data?: object;
} & ({
    type: CursorEventType;
    data: {
        point: Point;
    }
} | {
    type: KeyEventType;
    data: {
        key: number;
    }
});
