import net from 'net';
import { utf8Read, utf8Write } from '../lib/encoding';

import streamConsumers from 'stream/consumers';

import Multiplex from './multiplex';

const serv = net.createServer({allowHalfOpen: true},s => {
    const ms = new Multiplex(s);
    
    const a = ms.create('a');
    
    streamConsumers.json(a).then(val => console.log(val)).then(()=>{
        serv.close();
        a.end();
        s.destroy();
    });


}).listen(5002);


const so = net.connect({port: 5002, allowHalfOpen: true});
so.on('connect',()=>{
    const ms = new Multiplex(so);

    const a = ms.create('a');
    
    a.end(utf8Write(JSON.stringify({a: true, b: [1,2,3]})));
});


