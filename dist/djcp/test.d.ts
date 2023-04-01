import { Request, Response } from './protocol';
export interface Commands {
    'new': {
        req: {
            id: string;
        };
        res: void;
    };
    'own-id': {
        req: void;
        res: {
            id: string;
        };
    };
}
export declare const responseVerifier: (input: unknown) => input is Response<Commands, keyof Commands>;
export declare const requestVerifier: (input: unknown) => input is Request<Commands, keyof Commands>;
