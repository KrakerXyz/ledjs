import axios from 'axios';

type OrArray<T> = T | T[];
type Query = Record<string, OrArray<string> | OrArray<boolean> | OrArray<number> | undefined> | null | undefined

export class RestClient {

    private readonly axios = axios.create({
    });

    public get<T>(path: string, query?: Query): Promise<T> {
        return this.axios.get(path, {
            params: query
        }).then(r => r.data);
    }

    public post<T>(path: string, data: any, query?: Query): Promise<T> {
        return this.axios.post(path, data, {
            params: query
        }).then(r => r.data);
    }

}