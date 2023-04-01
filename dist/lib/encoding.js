"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uint8ArrayWriter = exports.Uint8ArrayReader = exports.utf8Write = exports.utf8Read = void 0;
const utf8Read = (arr) => Buffer.from(arr).toString('utf8');
exports.utf8Read = utf8Read;
const utf8Write = (str) => Buffer.from(str, 'utf-8');
exports.utf8Write = utf8Write;
const INITIAL_BUFFER_SIZE = 1024;
class Uint8ArrayReader extends Uint8Array {
    _position = 0;
    constructor(buffer) {
        super(buffer);
    }
    _readByte() {
        return this[this._position++];
    }
    _readVarInt() {
        let num = 0;
        let b = this[this._position++];
        let s = 0;
        while (b >= 0x80) {
            num |= (b & 0x7f) << s;
            s += 7;
            b = this[this._position++];
        }
        num |= (b & 0x7f) << s;
        return num;
    }
    _readUint8Array() {
        const size = this._readVarInt();
        return this.slice(this._position, (this._position += size));
    }
    _readString() {
        return (0, exports.utf8Read)(this._readUint8Array());
    }
}
exports.Uint8ArrayReader = Uint8ArrayReader;
class Uint8ArrayWriter {
    _position = 0;
    _buffer = new Uint8Array(INITIAL_BUFFER_SIZE);
    _writeByte(b) {
        if (b > 255) {
            throw '';
        }
        this._allocate(1);
        this._buffer[this._position++] = b;
    }
    _writeVarInt(n) {
        if (n < 0) {
            throw '';
        }
        while (n > 0x7f) {
            this._allocate(1);
            this._buffer[this._position++] = (n & 0x7f) | 0x80;
            n >>>= 7;
        }
        this._allocate(1);
        this._buffer[this._position++] = n;
    }
    _writeUint8Array(buf) {
        this._writeVarInt(buf.length);
        this._allocate(buf.length);
        this._buffer.set(buf, this._position);
        this._position += buf.length;
    }
    _writeString(s) {
        this._writeUint8Array((0, exports.utf8Write)(s));
    }
    _uint8array() {
        return new Uint8Array(this._buffer.buffer.slice(0, this._position));
    }
    _allocate(size) {
        let length = this._buffer.length;
        if (length < this._position + size) {
            while (length < this._position + size) {
                length *= 2;
            }
            const buf = new Uint8Array(length);
            buf.set(this._buffer);
            this._buffer = buf;
        }
    }
}
exports.Uint8ArrayWriter = Uint8ArrayWriter;
//# sourceMappingURL=encoding.js.map