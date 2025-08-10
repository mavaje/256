import './style.css';

import {OS} from "../server/os";
import {Font} from "../server/video/font";
import {Cursor} from "../server/video/cursor";
import {Toolbar} from "../server/video/toolbar";
import {Image} from "../server/video/wallpaper/image";
import {FS} from "../server/fs/fs";
import {Clickable} from "../server/video/clickable";

Promise.all([
    Font.load(),
    Cursor.load(),
    Toolbar.load(),
    FS.load(),
    Image.load(),
    Clickable.load(),
]).then(() => {
    const os = new OS();
    return os.start();

});
