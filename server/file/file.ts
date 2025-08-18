import nodepath from "path";
import {existsSync, mkdirSync} from "node:fs";
import {readFileSync, writeFileSync} from "fs";

export class File {

    private _exists: boolean = null;

    protected constructor(
        public name: string,
        public path: string,
        public extension: string,
    ) {}

    filename(
        name: string = this.name,
        path: string = this.path,
        extension: string = this.extension,
    ) {
        return `${path}/${name}.${extension}`;
    }

    exists() {
        return this._exists ??= existsSync(this.filename());
    }

    save(
        data: string | NodeJS.ArrayBufferView,
        name?: string,
        path?: string,
        extension?: string,
    ) {
        const filename = this.filename(name, path, extension);
        const directory = nodepath.dirname(filename);
        mkdirSync(directory, {recursive: true});
        writeFileSync(filename, data);
        this._exists = true;
        return this;
    }

    load_buffer() {
        return this.exists()
            ? readFileSync(this.filename())
            : null;
    }
}
