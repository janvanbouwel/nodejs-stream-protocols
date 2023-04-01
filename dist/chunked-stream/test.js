"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const chunked_1 = require("./chunked");
const serv = net_1.default.createServer(s => {
    const cs = new chunked_1.ChunkedStream(s);
    cs.on('data', data => {
        console.log(`server: ${data.length}, ${data.toString('utf-8')}`);
        cs.write('one');
        cs.write('two');
        cs.write('three');
        cs.write('four');
        cs.write('five');
    });
    cs.on('end', () => cs.end());
    cs.on('close', () => {
        console.log('close here');
        serv.close();
    });
    cs.on('error', err => console.log('serverr' + err));
}).listen(5002);
const so = net_1.default.connect({ port: 5002 });
so.on('connect', () => {
    const cws = new chunked_1.ChunkedStream(so);
    cws.on('data', data => {
        console.log(`client: ${data.length}, ${data.toString('utf-8')}`);
    });
    cws.on('error', (err) => console.log('errored' + err));
    cws.write(Buffer.from('client message', 'utf-8'));
});
// shows how normal socket would concatenate messages
// net.createServer(s => {
//     s.on('data', data=> {
//         console.log(`server: ${data.length}, ${data.toString('utf-8')}`);
//         s.write(Buffer.from('one message this is importartn', 'utf-8'));
//         s.write(Buffer.from('two', 'utf-8'));
//         s.write(Buffer.from('three', 'utf-8'));
//         s.write(Buffer.from('four', 'utf-8'));
//         s.write(Buffer.from('five', 'utf-8'));
//     });
// }).listen(5002);
// const so = net.connect({port: 5002});
// so.on('connect',()=>{
//     so.on('data', data => {
//         console.log(`client: ${data.length}, ${data.toString('utf-8')}`);
//     });
//     so.write(Buffer.from('client message', 'utf-8'));
// });
//# sourceMappingURL=test.js.map