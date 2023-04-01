
import {Duplex} from 'stream';
import { Uint8ArrayReader, Uint8ArrayWriter } from '../lib/encoding';


enum MessageKind {
    DATA = 1,
    END = 2,
    DESTROY = 3,
    DESTROY_ERR = 4
}


export function createDecode(
    onData: (id: string, data: Buffer) => void, 
    onEnd: (id: string)=>void,
    onDestroy: (id: string, err: boolean) => void): (data: Buffer) => void {
    return (data) => {
        const reader = new Uint8ArrayReader(data);

        const kind: MessageKind = reader._readByte();
        
        const id = reader._readString();

        if(kind === MessageKind.END) {
            onEnd(id);
            return;
        }
        if(kind === MessageKind.DESTROY) {
            onDestroy(id, false);
            return;
        }
        if(kind === MessageKind.DESTROY_ERR) {
            onDestroy(id, true);
            return;
        }

        const chunk = reader._readUint8Array();
        onData(id, Buffer.from(chunk));
    };
}

export function encodeWrite(stream: Duplex, id: string, chunk: Buffer, callback: (error?: Error | null | undefined) => void) {
    if(chunk.length === 0) return;

    const writer = new Uint8ArrayWriter();

    writer._writeByte(MessageKind.DATA);

    writer._writeString(id);
    writer._writeUint8Array(chunk);

    stream.write(writer._uint8array(), callback);
}

export function sendEnd(stream: Duplex, id: string, callback: (error?: Error | null | undefined) => void) {


    const writer = new Uint8ArrayWriter();

    writer._writeByte(MessageKind.END);
    writer._writeString(id);

    stream.write(writer._uint8array(), callback);
}

export function sendDestroy(stream: Duplex, id: string, callback: (error?: Error | null | undefined) => void) {
    const writer = new Uint8ArrayWriter();

    writer._writeByte(MessageKind.DESTROY);
    writer._writeString(id);

    stream.write(writer._uint8array(), callback);
}

export function sendDestroyErr(stream: Duplex, id: string, callback: (error?: Error | null | undefined) => void) {
    const writer = new Uint8ArrayWriter();

    writer._writeByte(MessageKind.DESTROY_ERR);
    writer._writeString(id);

    stream.write(writer._uint8array(), callback);
}


