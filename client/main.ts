import './style.css';

import {OS} from "../server/os";
import {Font} from "../server/video/font";
import {Cursor} from "../server/video/cursor";

Promise.all([
    Font.load_fonts(),
    Cursor.load_cursors(),
]).then(() => {
    const os = new OS();
    return os.start();
});
