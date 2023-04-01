import { Duplex } from 'stream';


export class MSChannel extends Duplex {
    constructor(
        readonly id: string,
        write: (chunk: Buffer, cb: (error?: Error | null | undefined) => void) => void,
        destroy: (error: Error | null, callback: (error: Error | null) => void) => void,
        final: (callback: (error?: Error | null | undefined) => void) => void) {    
        
        super({
            write: (chunk, _, cb) => write(chunk, cb),
            read: () => {
                return;
            },
            destroy,
            final,
            allowHalfOpen: true
        });
    }
}