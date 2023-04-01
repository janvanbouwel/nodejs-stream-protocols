/// <reference types="node" />
/// <reference types="node" />
import { Duplex } from 'stream';
export declare function createDecode(onData: (id: string, data: Buffer) => void, onEnd: (id: string) => void, onDestroy: (id: string, err: boolean) => void): (data: Buffer) => void;
export declare function encodeWrite(stream: Duplex, id: string, chunk: Buffer, callback: (error?: Error | null | undefined) => void): void;
export declare function sendEnd(stream: Duplex, id: string, callback: (error?: Error | null | undefined) => void): void;
export declare function sendDestroy(stream: Duplex, id: string, callback: (error?: Error | null | undefined) => void): void;
export declare function sendDestroyErr(stream: Duplex, id: string, callback: (error?: Error | null | undefined) => void): void;
