"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestVerifier = exports.responseVerifier = void 0;
const net_1 = __importDefault(require("net"));
const typescript_json_1 = require("typescript-json");
const djcp_1 = require("./djcp");
const serv = net_1.default.createServer({ allowHalfOpen: true }, s => {
    const m = djcp_1.DJCP.create(s, exports.responseVerifier, exports.requestVerifier);
    m.handle('new', req => {
        console.log(req);
    });
    m.handle('own-id', () => { return { id: 'abcd' }; });
    m.get('new', { id: 'abcd' }).then(res => console.log(res));
    m.get('own-id', undefined).then(res => console.log(res));
}).listen(5002);
const so = net_1.default.connect({ port: 5002, allowHalfOpen: true });
so.on('connect', () => {
    const m = djcp_1.DJCP.create(so, exports.responseVerifier, exports.requestVerifier);
    m.handle('new', req => {
        console.log(req);
    });
    m.handle('own-id', () => { return { id: 'abc' }; });
    m.get('new', { id: 'abc' }).then((res) => console.log(res));
    m.get('own-id', undefined).then(res => console.log(res));
});
exports.responseVerifier = (0, typescript_json_1.createIs)();
exports.requestVerifier = (0, typescript_json_1.createIs)();
//# sourceMappingURL=test.js.map