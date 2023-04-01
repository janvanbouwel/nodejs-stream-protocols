/// <reference types="node" />
import { Duplex } from 'stream';
import { BaseCommand, RequestVerifier, ResponseVerifier } from './protocol';
export declare class DJCP<T extends BaseCommand<T>> {
    private djcpRequest;
    private djcpRespond;
    get: <C extends keyof T>(command: C, req: T[C]["req"]) => Promise<T[C]["res"]>;
    handle: <C extends keyof T>(command: C, handler: (req: T[C]["req"]) => T[C]["res"] | Promise<T[C]["res"]>) => void;
    private constructor();
    static create<T extends BaseCommand<T>>(stream: Duplex, questVerifier: ResponseVerifier<T>, sponseVerifier: RequestVerifier<T>): DJCP<T>;
}
