
import { Readable } from 'stream';
import { Serializable } from '../djcp/protocol';
import { utf8Read, utf8Write } from './encoding';

export async function readStream(stream: Readable): Promise<Buffer> {
        
    return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0);
        
        stream.on('data', chunk => data = Buffer.concat([data, chunk]));
        stream.on('end', () => resolve(data));
        stream.on('error', error => reject(error));
    });
}

export function serialize(data: Serializable): Buffer {
    if(data === undefined) return Buffer.alloc(1);

    return Buffer.concat([Buffer.alloc(1,1), utf8Write(JSON.stringify(data??{}))]);
} 

export function parse(data: Buffer): unknown {

    try {
        if(data[0] === 0) return undefined;

        return JSON.parse(utf8Read(data.subarray(1))) as unknown;
    } catch (error) {
        throw new Error('Received data was not valid JSON');
    }
    
}