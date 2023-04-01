/// <reference types="node" />
/// <reference types="node" />
import { Readable } from 'stream';
import { Serializable } from '../djcp/protocol';
export declare function readStream(stream: Readable): Promise<Buffer>;
export declare function serialize(data: Serializable): Buffer;
export declare function parse(data: Buffer): unknown;
