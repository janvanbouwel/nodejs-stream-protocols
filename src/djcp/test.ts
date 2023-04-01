import net from 'net';


import { createIs } from 'typescript-json';
import { DJCP } from './djcp';
import { Request, Response } from './protocol';




const serv = net.createServer({allowHalfOpen: true},s => {
    const m = DJCP.create(s, responseVerifier, requestVerifier);

    m.handle('new', req => {
        console.log(req);
    });

    m.handle('own-id', () => {return {id: 'abcd'};});

    m.get('new', {id: 'abcd'}).then(res => console.log(res));
    m.get('own-id', undefined).then(res => console.log(res));


}).listen(5002);


const so = net.connect({port: 5002, allowHalfOpen: true});
so.on('connect', () => {
    const m = DJCP.create(so, responseVerifier, requestVerifier);

    m.handle('new', req => {
        console.log(req);
    });

    m.handle('own-id', () => {return {id: 'abc'};});

    m.get('new', {id: 'abc'}).then((res) => console.log(res));
    m.get('own-id', undefined).then(res => console.log(res));
});



export interface Commands {
    'new': {
        req: {id: string},
        res: void
    },
    'own-id': {
        req: void,
        res: {id: string}
    }
}

export const responseVerifier = createIs<Response<Commands>>();
export const requestVerifier = createIs<Request<Commands>>();