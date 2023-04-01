"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDestroyErr = exports.sendDestroy = exports.sendEnd = exports.encodeWrite = exports.createDecode = void 0;
const encoding_1 = require("../lib/encoding");
var MessageKind;
(function (MessageKind) {
    MessageKind[MessageKind["DATA"] = 1] = "DATA";
    MessageKind[MessageKind["END"] = 2] = "END";
    MessageKind[MessageKind["DESTROY"] = 3] = "DESTROY";
    MessageKind[MessageKind["DESTROY_ERR"] = 4] = "DESTROY_ERR";
})(MessageKind || (MessageKind = {}));
function createDecode(onData, onEnd, onDestroy) {
    return (data) => {
        const reader = new encoding_1.Uint8ArrayReader(data);
        const kind = reader._readByte();
        const id = reader._readString();
        if (kind === MessageKind.END) {
            onEnd(id);
            return;
        }
        if (kind === MessageKind.DESTROY) {
            onDestroy(id, false);
            return;
        }
        if (kind === MessageKind.DESTROY_ERR) {
            onDestroy(id, true);
            return;
        }
        const chunk = reader._readUint8Array();
        onData(id, Buffer.from(chunk));
    };
}
exports.createDecode = createDecode;
function encodeWrite(stream, id, chunk, callback) {
    if (chunk.length === 0)
        return;
    const writer = new encoding_1.Uint8ArrayWriter();
    writer._writeByte(MessageKind.DATA);
    writer._writeString(id);
    writer._writeUint8Array(chunk);
    stream.write(writer._uint8array(), callback);
}
exports.encodeWrite = encodeWrite;
function sendEnd(stream, id, callback) {
    const writer = new encoding_1.Uint8ArrayWriter();
    writer._writeByte(MessageKind.END);
    writer._writeString(id);
    stream.write(writer._uint8array(), callback);
}
exports.sendEnd = sendEnd;
function sendDestroy(stream, id, callback) {
    const writer = new encoding_1.Uint8ArrayWriter();
    writer._writeByte(MessageKind.DESTROY);
    writer._writeString(id);
    stream.write(writer._uint8array(), callback);
}
exports.sendDestroy = sendDestroy;
function sendDestroyErr(stream, id, callback) {
    const writer = new encoding_1.Uint8ArrayWriter();
    writer._writeByte(MessageKind.DESTROY_ERR);
    writer._writeString(id);
    stream.write(writer._uint8array(), callback);
}
exports.sendDestroyErr = sendDestroyErr;
//# sourceMappingURL=protocol.js.map