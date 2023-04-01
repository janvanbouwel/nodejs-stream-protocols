/// <reference types="node" />
/// <reference types="node" />
import { Duplex } from 'stream';
export declare class MSChannel extends Duplex {
    readonly id: string;
    constructor(id: string, write: (chunk: Buffer, cb: (error?: Error | null | undefined) => void) => void, destroy: (error: Error | null, callback: (error: Error | null) => void) => void, final: (callback: (error?: Error | null | undefined) => void) => void);
}
