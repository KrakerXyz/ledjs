import axios from 'axios';

type OrArray<T> = T | T[];
type Query = Record<string, OrArray<string> | OrArray<boolean> | OrArray<number> | undefined> | null | undefined

export class RestClient {

    public readonly origin: string = 'http://localhost:3001';
    private readonly axiosInstance;

    public constructor(config?: Partial<RestConfig>) {
        if (config?.origin) { this.origin = config.origin; }

        this.axiosInstance = axios.create({
            baseURL: this.origin
        });
    }

    public get<T>(path: string, query?: Query): Promise<T> {
        return this.axiosInstance.get(path, {
            params: query
        }).then(r => r.data);
    }

    public post<T>(path: string, data: any, query?: Query): Promise<T> {
        return this.axiosInstance.post(path, data, {
            params: query
        }).then(r => r.data);
    }

}

export interface RestConfig {
    origin: `${'http' | 'https'}://${string}`;
}