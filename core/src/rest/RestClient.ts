import axios from 'axios';

type OrArray<T> = T | T[];
type Query = Record<string, OrArray<string> | OrArray<boolean> | OrArray<number> | undefined> | null | undefined

export class RestClient {

    public readonly baseUrl: string;
    private readonly axiosInstance;

    public constructor(config?: Partial<RestConfig>) {
        this.baseUrl = config?.baseUrl ?? 'https://netled.io';
        if (!this.baseUrl.startsWith('http')) { throw new Error('Origin should start with http'); }
        if (this.baseUrl.endsWith('/')) { throw new Error('baseUrl should not have a trailing slash'); }

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl
        });
    }

    public get<T>(path: string, query?: Query): Promise<T> {
        return this.axiosInstance.get(path, {
            params: query
        }).then(r => deepFreeze(r.data));
    }

    public post<T>(path: string, data: any, query?: Query): Promise<T> {
        return this.axiosInstance.post(path, data, {
            params: query
        }).then(r => deepFreeze(r.data));
    }

    public delete(path: string): Promise<void> {
        return this.axiosInstance.delete(path);
    }

}

export interface RestConfig {
    baseUrl: `${'http' | 'https'}://${string}`,
}

export function deepFreeze<T>(o: T): T {
    if (o === null || o === undefined) { return o; }
    if (typeof o !== 'object') { return o; }

    Object.freeze(o);

    if (Array.isArray(o)) {
        for (const i of o) {
            deepFreeze(i);
        }

        return o;
    }

    for (const p of Object.getOwnPropertyNames(o)) {
        deepFreeze<any>((o as any)[p]);
    }

    return o;
}
