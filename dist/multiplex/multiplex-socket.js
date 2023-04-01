"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSChannel = void 0;
const stream_1 = require("stream");
class MSChannel extends stream_1.Duplex {
    id;
    constructor(id, write, destroy, final) {
        super({
            write: (chunk, _, cb) => write(chunk, cb),
            read: () => {
                return;
            },
            destroy,
            final,
            allowHalfOpen: true
        });
        this.id = id;
    }
}
exports.MSChannel = MSChannel;
//# sourceMappingURL=multiplex-socket.js.map