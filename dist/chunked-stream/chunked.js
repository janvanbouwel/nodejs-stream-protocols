"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkedStream = void 0;
const stream_1 = require("stream");
const types_1 = require("util/types");
const data_1 = require("./data");
class ChunkedStream extends stream_1.Duplex {
    duplex;
    constructor(duplex) {
        super({
            write: (chunk, _, cb) => {
                duplex.write((0, data_1.encode)(chunk), undefined, cb);
            },
            read: () => {
                return;
            },
            final(callback) {
                duplex.end();
                callback();
            },
            destroy(error, callback) {
                duplex.destroy(error ?? undefined);
                callback(error);
            },
            readableObjectMode: true,
            writableObjectMode: true
        });
        this.duplex = duplex;
        this.startReading();
    }
    async startReading() {
        const decode = (0, data_1.createDecode)();
        try {
            for await (const chunk of this.duplex) {
                for (const msg of decode(chunk)) {
                    this.push(msg);
                }
            }
            this.push(null);
        }
        catch (error) {
            if ((0, types_1.isNativeError)(error))
                this.destroy(error);
            else
                this.destroy();
        }
    }
}
exports.ChunkedStream = ChunkedStream;
//# sourceMappingURL=chunked.js.map