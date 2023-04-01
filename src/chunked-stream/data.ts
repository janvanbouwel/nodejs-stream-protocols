
const BODY_LENGTH_LENGTH = 4;
const MAX_BODY_LENGTH = 2 ** (8 * BODY_LENGTH_LENGTH);


export function encode(data: Uint8Array): Buffer {
    if (data.length >= MAX_BODY_LENGTH) throw new Error('payload too large');

    const bodyLength = Buffer.alloc(BODY_LENGTH_LENGTH);
    bodyLength.writeUInt32BE(data.length);

    return Buffer.concat([bodyLength, data]);
}

export function createDecode(): (data: Buffer) => IterableIterator<Buffer> {
    let buffer = Buffer.alloc(0);
    let step = 0;

    let bodyLength = 0;

    return function * (data: Buffer): IterableIterator<Buffer> {
        buffer = Buffer.concat([buffer, data]);
        let offset = 0;
        let cont = true;

        while (cont) {
            switch (step) {
            case 0:
                if (buffer.length >= BODY_LENGTH_LENGTH + offset) {
                    bodyLength = buffer.readUInt32BE(offset);
                    offset += BODY_LENGTH_LENGTH;
                    step = + 1;
                } else cont = false;
                break;
            case 1:
                if (buffer.length >= bodyLength + offset) {
                    const body = buffer.subarray(offset, bodyLength + offset);

                    buffer = buffer.subarray(offset + bodyLength);
                    offset = 0;
                    bodyLength = 0;
                    step = 0;

                    yield body;

                } else cont = false;
                break;
            }
        }
        buffer = buffer.subarray(offset);
    };
}
