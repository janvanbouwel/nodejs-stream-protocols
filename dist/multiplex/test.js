"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const encoding_1 = require("../lib/encoding");
const consumers_1 = __importDefault(require("stream/consumers"));
const multiplex_1 = __importDefault(require("./multiplex"));
const serv = net_1.default.createServer({ allowHalfOpen: true }, s => {
    const ms = new multiplex_1.default(s);
    const a = ms.create('a');
    consumers_1.default.json(a).then(val => console.log(val)).then(() => {
        serv.close();
        a.end();
        s.destroy();
    });
}).listen(5002);
const so = net_1.default.connect({ port: 5002, allowHalfOpen: true });
so.on('connect', () => {
    const ms = new multiplex_1.default(so);
    const a = ms.create('a');
    a.end((0, encoding_1.utf8Write)(JSON.stringify({ a: true, b: [1, 2, 3] })));
});
//# sourceMappingURL=test.js.map