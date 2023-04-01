/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Duplex } from 'stream';
import { EventEmitter } from 'events';
import { MSChannel } from './multiplex-socket';
export interface MultiplexEvents {
    'close': () => void;
    'new-channel': (ms: MSChannel) => void;
}
declare interface Multiplex {
    on<E extends keyof MultiplexEvents>(event: E, listener: MultiplexEvents[E]): this;
    emit<E extends keyof MultiplexEvents>(event: E, ...args: Parameters<MultiplexEvents[E]>): boolean;
}
/**
 * A multiplexer that creates duplex streams associated with an id, that are written to/read from an original given stream (for example a net.Socket).
 *
 * // TODO: refactor to give socket semantics? (open/close specifically), add signaling built-in
 */
declare class Multiplex extends EventEmitter {
    private stream;
    private closed;
    private persistent;
    private writeBuffer;
    emitNew: boolean;
    routes: Map<string, MSChannel>;
    isClosed(): boolean;
    constructor(stream: Duplex, { persistent, emitNew }?: {
        persistent?: boolean | undefined;
        emitNew?: boolean | undefined;
    });
    decode: (data: Buffer) => void;
    route(id: string, data: Buffer): void;
    private onEnd;
    private onDestroy;
    create(id: string): MSChannel;
    createRandom(): [MSChannel, string];
    private sendEnd;
    private sendDestroy;
    private sendDestroyErr;
    write(id: string, chunk: Buffer, callback: (error?: Error | null | undefined) => void): void;
    private startReading;
    migrate(stream: Duplex): void;
}
export default Multiplex;
