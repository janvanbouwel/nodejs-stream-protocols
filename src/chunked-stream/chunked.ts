import { Duplex } from 'stream';
import { isNativeError } from 'util/types';
import { createDecode, encode } from './data';


export class ChunkedStream extends Duplex {
    constructor(private duplex: Duplex ) {
        super({
            write: (chunk, _, cb) => {
                duplex.write(encode(chunk), undefined, cb);
            },
            read: () => {
                return;
            },
            final(callback) {
                duplex.end();
                callback();
            },
            destroy(error, callback) {
                duplex.destroy(error??undefined);
                callback(error);
            },
            readableObjectMode: true,
            writableObjectMode: true
        });
        this.startReading();
    }

    private async startReading(): Promise<void> {
        const decode = createDecode();
        
        try {
            for await (const chunk of this.duplex) {
                for(const msg of decode(chunk)){
                    this.push(msg);
                } 
            }
            this.push(null);
        } catch (error) {
            if(isNativeError(error)) this.destroy(error);
            else this.destroy();
        }
    }
}
