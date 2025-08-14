export class ByteArray extends Uint8Array {
    private offset = 0;

    push(byte: number): this;
    push(value: number, length?: number, offset?: number): this;
    push(value: string, length?: number, offset?: number): this;
    push(value: ArrayLike<number>, offset?: number): this;
    push(
        value: number | string | ArrayLike<number>,
        length: number = typeof value === 'number' ? 1 : value.length,
        offset = this.offset,
    ) {
        switch (typeof value) {
            case 'number':
                for (let byte = 0; byte < length; byte++) {
                    this[offset + byte] = (value >>> (8 * (length - byte - 1))) & 0xFF;
                    this.offset++;
                }
                return this;

            case 'string':
                for (let byte = 0; byte < length; byte++) {
                    this[offset + byte] = value.charCodeAt(byte);
                    this.offset++;
                }
                return this;

            default:
                this.set(value, this.offset);
                this.offset += value.length;
                return this;
        }
    }
}
