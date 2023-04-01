export declare type Serializable = undefined | void | boolean | string | symbol | number | Serializable[] | {
    [s in string]: Serializable;
};
export declare type BaseCommand<T> = {
    [key in keyof T]: {
        req: Serializable;
        res: Serializable;
    };
};
export declare function isRequest<T extends BaseCommand<T>, C extends keyof T>(command: C, request: Request<T>): request is Request<T, C>;
export declare type Request<T extends BaseCommand<T>, C extends keyof T = keyof T> = {
    command: C;
    payload: T[C]['req'];
};
export declare type RequestVerifier<T extends BaseCommand<T>> = (x: unknown) => x is Request<T>;
export declare function isResponse<T extends BaseCommand<T>, C extends keyof T>(command: C, response: Response<T>): response is Response<T, C>;
export declare type Response<T extends BaseCommand<T>, C extends keyof T = keyof T> = {
    command: C;
    payload: T[C]['res'];
};
export declare type ResponseVerifier<T extends BaseCommand<T>> = (x: unknown) => x is Response<T>;
