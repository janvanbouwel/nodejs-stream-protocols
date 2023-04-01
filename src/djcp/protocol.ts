
export type Serializable = undefined | void | boolean | string | symbol | number | Serializable[] | {[s in string]: Serializable};


export type BaseCommand<T> = {
    [key in keyof T]: {
        req: Serializable
        res: Serializable
    }
}

export function isRequest<T extends BaseCommand<T>, C extends keyof T>(command: C, request: Request<T>): request is Request<T,C> {
    return request.command === command;
}

export type Request<T extends BaseCommand<T>, C extends keyof T = keyof T> = {
    command: C,
    payload: T[C]['req']
}

export type RequestVerifier<T extends BaseCommand<T>> = (x: unknown) => x is Request<T>;

export function isResponse<T extends BaseCommand<T>, C extends keyof T>(command: C, response: Response<T>): response is Response<T,C> {
    return response.command === command;
}

export type Response<T extends BaseCommand<T>, C extends keyof T = keyof T> = {
    command: C,
    payload: T[C]['res']
}

export type ResponseVerifier<T extends BaseCommand<T>> = (x: unknown) => x is Response<T>;

