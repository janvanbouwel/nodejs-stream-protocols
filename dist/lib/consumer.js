"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.serialize = exports.readStream = void 0;
const encoding_1 = require("./encoding");
async function readStream(stream) {
    return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0);
        stream.on('data', chunk => data = Buffer.concat([data, chunk]));
        stream.on('end', () => resolve(data));
        stream.on('error', error => reject(error));
    });
}
exports.readStream = readStream;
function serialize(data) {
    if (data === undefined)
        return Buffer.alloc(1);
    return Buffer.concat([Buffer.alloc(1, 1), (0, encoding_1.utf8Write)(JSON.stringify(data ?? {}))]);
}
exports.serialize = serialize;
function parse(data) {
    try {
        if (data[0] === 0)
            return undefined;
        return JSON.parse((0, encoding_1.utf8Read)(data.subarray(1)));
    }
    catch (error) {
        throw new Error('Received data was not valid JSON');
    }
}
exports.parse = parse;
//# sourceMappingURL=consumer.js.map