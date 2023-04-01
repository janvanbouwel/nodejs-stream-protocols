import { Duplex, finished } from 'stream';
import { EventEmitter } from 'events';
import { sendEnd, encodeWrite, createDecode, sendDestroy, sendDestroyErr } from './protocol';
import { MSChannel } from './multiplex-socket';
import crypto from 'crypto';
import { ChunkedStream } from '../chunked-stream';

import debugM from 'debug';
const debug = debugM('multi');

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
class Multiplex extends EventEmitter {
    private stream: ChunkedStream | undefined;
    private closed = false;
    private persistent;
    private writeBuffer: { id: string, chunk: Buffer, callback: (error?: Error | null | undefined) => void }[] = [];

    emitNew;

    routes: Map<string, MSChannel> = new Map();


    isClosed() { return this.closed; }

    constructor(stream: Duplex, { persistent = false, emitNew = false } = {}) {
        super();

        this.persistent = persistent;
        this.emitNew = emitNew;
        this.migrate(stream);
    }

    decode = createDecode(this.route.bind(this), this.onEnd.bind(this), this.onDestroy.bind(this));

    route(id: string, data: Buffer) {
        let ms = this.routes.get(id);
        if (!ms && this.emitNew) {
            ms = this.create(id);
            this.emit('new-channel', ms);
        }

        if (ms) {
            ms.push(data);
        }
    }

    private onEnd(channel: string) {
        const ms = this.routes.get(channel);
        if (!ms) return;
        ms.push(null);
    }

    private onDestroy(channel: string, err: boolean) {
        const ms = this.routes.get(channel);
        if (!ms) return;
        if(err) ms.destroy(Error('Channel was destroyed'));
        else ms.destroy();
    }



    create(id: string): MSChannel {
        if (this.closed) throw new Error('This Multiplex has been closed.');
        if (this.routes.has(id)) throw new Error('Cant use same channel name multiple times');

        const ms = new MSChannel(
            id,
            (chunk, cb) => this.write(id, chunk, cb),
            (err, cb) => {
                if(err) this.sendDestroyErr(id, () => cb(err));
                else this.sendDestroy(id, () => cb(err));
            },
            cb => {
                this.sendEnd(id, cb);
            });

        this.routes.set(id, ms);

        finished(ms, () => {
            this.routes.delete(id);
        });

        return ms;
    }

    createRandom(): [MSChannel, string] {
        let routeId: string;
        do {
            routeId = 'p' + crypto.randomBytes(4).toString('base64');
        } while (this.routes.has(routeId));
        return [this.create(routeId), routeId];
    }

    private sendEnd(channel: string, callback: (error?: Error | null | undefined) => void) {
        if (this.stream) sendEnd(this.stream, channel, callback);
        else callback(new Error('Stream closed'));
    }

    private sendDestroy(channel: string, callback: (error?: Error | null | undefined) => void) {
        if(this.stream) sendDestroy(this.stream, channel, callback);
        else callback(new Error('Stream closed'));
    }

    private sendDestroyErr(channel: string, callback: (error?: Error | null | undefined) => void) {
        if(this.stream) sendDestroyErr(this.stream, channel, callback);
        else callback(new Error('Stream closed'));
    }

    write(id: string, chunk: Buffer, callback: (error?: Error | null | undefined) => void) {
        if (this.stream && this.stream.writable) encodeWrite(this.stream, id, chunk, callback);
        else {
            if (this.persistent) this.writeBuffer.push({ id, chunk, callback });
            else callback(new Error('Stream closed'));
        }
    }

    private async startReading(): Promise<void> {
        if (!this.stream) return;
        try {
            for await (const chunk of this.stream) {
                this.decode(chunk);
            }
        } catch (error) {
            debug(error);
            //
        }
        this.stream = undefined;
        this.closed = true;
        if (!this.persistent) {
            this.routes.forEach(val => {
                val.destroy(Error('underlying stream of this multi closed'));
            });
            this.emit('close');
        }
    }

    migrate(stream: Duplex) {
        this.stream = new ChunkedStream(stream);

        this.startReading();

        for (const item of this.writeBuffer) {
            encodeWrite(stream, item.id, item.chunk, item.callback);
        }
        this.writeBuffer = [];
    }
}


export default Multiplex;