"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DJCP = void 0;
const index_1 = require("../multiplex/index");
const consumer_1 = require("../lib/consumer");
const protocol_1 = require("./protocol");
const util_1 = __importDefault(require("util"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('djcp');
class DJCPRequest {
    multi;
    verifier;
    constructor(multi, verifier) {
        this.multi = multi;
        this.verifier = verifier;
    }
    async get(command, req) {
        const [channel] = this.multi.createRandom();
        const body = (0, consumer_1.serialize)({ command: command, payload: req });
        await new Promise((resolve, reject) => channel.write(body, undefined, err => err ? reject(err) : resolve()));
        channel.end();
        const data = await (0, consumer_1.readStream)(channel);
        if (data.length === 0)
            throw new Error('No response received. Potential error on other side');
        const payload = (0, consumer_1.parse)(data);
        const response = { command, payload: payload };
        if (this.verifier(response))
            return response.payload;
        throw Error('Invalid response received, request was not properly handled.');
    }
}
class DJCPRespond {
    requestVerifier;
    listeners = new Map();
    constructor(multi, requestVerifier) {
        this.requestVerifier = requestVerifier;
        multi.on('new-channel', async (ms) => {
            debug('new channel', ms.id);
            try {
                const data = await (0, consumer_1.readStream)(ms);
                await this.handle(ms, (0, consumer_1.parse)(data));
            }
            catch (error) {
                debug('Error while processing channel %s: %s', ms.id, error);
                ms.end();
            }
        });
    }
    async handle(ms, request) {
        debug('channel %s received %s', ms.id, util_1.default.format(request));
        if (!this.requestVerifier(request))
            throw new Error('Invalid payload');
        const handler = this.listeners.get(request.command);
        if (!handler)
            throw new Error('No handler registered');
        const result = await handler(request.payload);
        const body = (0, consumer_1.serialize)(result);
        await new Promise((resolve, reject) => ms.write(body, undefined, err => err ? reject(err) : resolve()));
        ms.end();
    }
    res(command, handler) {
        this.listeners.set(command, async (payload) => {
            if (!(0, protocol_1.isRequest)(command, { command, payload }))
                throw new Error('Invalid payload received');
            try {
                return await handler(payload);
            }
            catch (error) {
                throw new Error(`Error while handling payload: ${error}`);
            }
        });
    }
}
class DJCP {
    djcpRequest;
    djcpRespond;
    get;
    handle;
    constructor(stream, responseVerifier, requestVerifier) {
        const multi = new index_1.Multiplex(stream, { emitNew: true });
        this.djcpRequest = new DJCPRequest(multi, responseVerifier);
        this.djcpRespond = new DJCPRespond(multi, requestVerifier);
        this.get = this.djcpRequest.get.bind(this.djcpRequest);
        this.handle = this.djcpRespond.res.bind(this.djcpRespond);
    }
    static create(stream, questVerifier, sponseVerifier) {
        return new DJCP(stream, questVerifier, sponseVerifier);
    }
}
exports.DJCP = DJCP;
//# sourceMappingURL=djcp.js.map