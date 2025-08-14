export class File {

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
}
