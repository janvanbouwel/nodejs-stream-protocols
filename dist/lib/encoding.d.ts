/// <reference types="node" />
export declare const utf8Read: (arr: Uint8Array) => string;
export declare const utf8Write: (str: string) => Buffer;
export declare class Uint8ArrayReader extends Uint8Array {
    private _position;
    constructor(buffer: Uint8Array);
    _readByte(): number;
    _readVarInt(): number;
    _readUint8Array(): Uint8Array;
    _readString(): string;
}
export declare class Uint8ArrayWriter {
    private _position;
    private _buffer;
    _writeByte(b: number): void;
    _writeVarInt(n: number): void;
    _writeUint8Array(buf: Uint8Array): void;
    _writeString(s: string): void;
    _uint8array(): Uint8Array;
    private _allocate;
}
