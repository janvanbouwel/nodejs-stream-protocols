/// <reference types="node" />
export declare function encode(data: Uint8Array): Buffer;
export declare function createDecode(): (data: Buffer) => IterableIterator<Buffer>;
