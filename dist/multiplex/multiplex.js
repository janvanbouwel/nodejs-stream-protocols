"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const events_1 = require("events");
const protocol_1 = require("./protocol");
const multiplex_socket_1 = require("./multiplex-socket");
const crypto_1 = __importDefault(require("crypto"));
const chunked_stream_1 = require("../chunked-stream");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('multi');
/**
 * A multiplexer that creates duplex streams associated with an id, that are written to/read from an original given stream (for example a net.Socket).
 *
 * // TODO: refactor to give socket semantics? (open/close specifically), add signaling built-in
 */
class Multiplex extends events_1.EventEmitter {
    stream;
    closed = false;
    persistent;
    writeBuffer = [];
    emitNew;
    routes = new Map();
    isClosed() { return this.closed; }
    constructor(stream, { persistent = false, emitNew = false } = {}) {
        super();
        this.persistent = persistent;
        this.emitNew = emitNew;
        this.migrate(stream);
    }
    decode = (0, protocol_1.createDecode)(this.route.bind(this), this.onEnd.bind(this), this.onDestroy.bind(this));
    route(id, data) {
        let ms = this.routes.get(id);
        if (!ms && this.emitNew) {
            ms = this.create(id);
            this.emit('new-channel', ms);
        }
        if (ms) {
            ms.push(data);
        }
    }
    onEnd(channel) {
        const ms = this.routes.get(channel);
        if (!ms)
            return;
        ms.push(null);
    }
    onDestroy(channel, err) {
        const ms = this.routes.get(channel);
        if (!ms)
            return;
        if (err)
            ms.destroy(Error('Channel was destroyed'));
        else
            ms.destroy();
    }
    create(id) {
        if (this.closed)
            throw new Error('This Multiplex has been closed.');
        if (this.routes.has(id))
            throw new Error('Cant use same channel name multiple times');
        const ms = new multiplex_socket_1.MSChannel(id, (chunk, cb) => this.write(id, chunk, cb), (err, cb) => {
            if (err)
                this.sendDestroyErr(id, () => cb(err));
            else
                this.sendDestroy(id, () => cb(err));
        }, cb => {
            this.sendEnd(id, cb);
        });
        this.routes.set(id, ms);
        (0, stream_1.finished)(ms, () => {
            this.routes.delete(id);
        });
        return ms;
    }
    createRandom() {
        let routeId;
        do {
            routeId = 'p' + crypto_1.default.randomBytes(4).toString('base64');
        } while (this.routes.has(routeId));
        return [this.create(routeId), routeId];
    }
    sendEnd(channel, callback) {
        if (this.stream)
            (0, protocol_1.sendEnd)(this.stream, channel, callback);
        else
            callback(new Error('Stream closed'));
    }
    sendDestroy(channel, callback) {
        if (this.stream)
            (0, protocol_1.sendDestroy)(this.stream, channel, callback);
        else
            callback(new Error('Stream closed'));
    }
    sendDestroyErr(channel, callback) {
        if (this.stream)
            (0, protocol_1.sendDestroyErr)(this.stream, channel, callback);
        else
            callback(new Error('Stream closed'));
    }
    write(id, chunk, callback) {
        if (this.stream && this.stream.writable)
            (0, protocol_1.encodeWrite)(this.stream, id, chunk, callback);
        else {
            if (this.persistent)
                this.writeBuffer.push({ id, chunk, callback });
            else
                callback(new Error('Stream closed'));
        }
    }
    async startReading() {
        if (!this.stream)
            return;
        try {
            for await (const chunk of this.stream) {
                this.decode(chunk);
            }
        }
        catch (error) {
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
    migrate(stream) {
        this.stream = new chunked_stream_1.ChunkedStream(stream);
        this.startReading();
        for (const item of this.writeBuffer) {
            (0, protocol_1.encodeWrite)(stream, item.id, item.chunk, item.callback);
        }
        this.writeBuffer = [];
    }
}
exports.default = Multiplex;
//# sourceMappingURL=multiplex.js.map