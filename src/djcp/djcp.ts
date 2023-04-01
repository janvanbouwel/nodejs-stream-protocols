import { Multiplex } from '../multiplex/index';


import { Duplex } from 'stream';
import { parse, readStream, serialize } from '../lib/consumer';
import { BaseCommand, isRequest, RequestVerifier, ResponseVerifier } from './protocol';

import util from 'util';

import debugM from 'debug';
import { MSChannel } from '../multiplex/multiplex-socket';
const debug = debugM('djcp');


class DJCPRequest<T extends BaseCommand<T>> {

    constructor(private multi: Multiplex, private verifier: ResponseVerifier<T>) { }


    async get<C extends keyof T>(command: C, req: T[C]['req']): Promise<T[C]['res']> {
        const [channel] = this.multi.createRandom();

        const body =  serialize({ command: command, payload: req });

        await new Promise<void>((resolve, reject) => channel.write(body, undefined, err => err ? reject(err) : resolve()));
        channel.end();

        const data = await readStream(channel);
        if(data.length === 0) throw new Error('No response received. Potential error on other side');
        const payload = parse(data);

        const response = { command, payload: payload };

        if (this.verifier(response)) return response.payload;

        throw Error('Invalid response received, request was not properly handled.');
    }
}

class DJCPRespond<T extends BaseCommand<T>> {
    listeners: Map<
        keyof T,
        <C extends keyof T>(req: T[C]['req']) => Promise<T[C]['res']>
    > = new Map();


    constructor(multi: Multiplex, private requestVerifier: RequestVerifier<T>) {
        multi.on('new-channel', async (ms) => {
            debug('new channel', ms.id);
            try {
                const data = await readStream(ms);
                await this.handle(ms, parse(data));
            } catch (error) {
                debug('Error while processing channel %s: %s', ms.id, error);
                ms.end();
            }
        });
    }

    async handle(ms: MSChannel, request: unknown) {
        debug('channel %s received %s', ms.id, util.format(request));
        if (!this.requestVerifier(request)) throw new Error('Invalid payload');

        const handler = this.listeners.get(request.command);
        if (!handler) throw new Error('No handler registered');

        const result = await handler(request.payload);
        const body = serialize(result);

        await new Promise<void>((resolve, reject) => ms.write(body, undefined, err => err ? reject(err) : resolve()));
        ms.end();
    }


    res<C extends keyof T>(command: C, handler: (req: T[C]['req']) => T[C]['res'] | Promise<T[C]['res']>) {
        this.listeners.set(command, async (payload) => {
            if (!isRequest(command, { command, payload })) throw new Error('Invalid payload received');

            try {
                return await handler(payload);
            } catch (error) {
                throw new Error(`Error while handling payload: ${error}`);
            }
        });
    }
}



export class DJCP<T extends BaseCommand<T>> {
    private djcpRequest;
    private djcpRespond;

    get;
    handle;

    private constructor(stream: Duplex, responseVerifier: ResponseVerifier<T>, requestVerifier: RequestVerifier<T>) {
        const multi = new Multiplex(stream, { emitNew: true });
        this.djcpRequest = new DJCPRequest<T>(multi, responseVerifier);
        this.djcpRespond = new DJCPRespond<T>(multi, requestVerifier);

        this.get = this.djcpRequest.get.bind(this.djcpRequest);
        this.handle = this.djcpRespond.res.bind(this.djcpRespond);
    }

    static create<T extends BaseCommand<T>>(stream: Duplex, questVerifier: ResponseVerifier<T>, sponseVerifier: RequestVerifier<T>): DJCP<T> {
        return new DJCP(stream, questVerifier, sponseVerifier);
    }
}
