export class ByteArray extends Uint8ClampedArray {
    private offset = 0;

    push(byte: number): this;
    push(value: number, length?: number, offset?: number): this;
    push(value: string, length?: number, offset?: number): this;
    push(value: ArrayLike<number>, offset?: number): this;
    push(
        value: number | string | ArrayLike<number>,
        length?: number,
        offset = this.offset,
    ) {
        switch (typeof value) {
            case 'number':
                length ??= 1;
                for (let byte = 0; byte < length; byte++) {
                    this[offset + byte] = (value >>> (8 * (length - byte - 1))) & 0xFF;
                }
                this.offset = offset + length;
                return this;

            case 'string':
                length ??= value.length;
                for (let byte = 0; byte < length; byte++) {
                    this[offset + byte] = value.charCodeAt(byte);
                }
                this.offset = offset + length;
                return this;

            default:
                if (length || length === 0) offset = length;
                this.set(value, offset);
                this.offset = offset + value.length;
                return this;
        }
    }

    slice(start: number = 0, end: number = this.length): ByteArray {
        return new ByteArray((end - start) % this.length).push(this.subarray(start, end));
    }

    integer(): number {
        let value = 0;
        for (let i = 0; i < this.length; i++) {
            value <<= 8;
            value |= this[i];
        }
        return value;
    }

    string(): string {
        return String.fromCharCode(...this);
    }

    array(): number[] {
        return [...this];
    }
}
