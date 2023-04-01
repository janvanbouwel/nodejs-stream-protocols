/// <reference types="node" />
import { Duplex } from 'stream';
export declare class ChunkedStream extends Duplex {
    private duplex;
    constructor(duplex: Duplex);
    private startReading;
}
