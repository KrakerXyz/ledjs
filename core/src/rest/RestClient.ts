
type OrArray<T> = T | T[];
type Query = Record<string, OrArray<string> | OrArray<boolean> | OrArray<number> | undefined> | URLSearchParams | null | undefined

export class RestClient {

    public readonly baseUrl: string;
    private readonly headers: Record<string, string> = {};

    public constructor(config?: Partial<RestConfig>) {
        this.baseUrl = config?.baseUrl ?? 'https://netled.io';
        if (!this.baseUrl.startsWith('http')) { throw new Error('Origin should start with http'); }
        if (this.baseUrl.endsWith('/')) { throw new Error('baseUrl should not have a trailing slash'); }

        if (config?.authorization) {
            this.headers['Authorization'] = config.authorization;
        }
    }

    public get<T>(path: string, query?: Query): Promise<T> {
        const url = this.createUrl(path, query);
        return fetch(url, { headers: this.headers }).then(r => r.json() as T).then(r => deepFreeze(r));
    }

    public post<T>(path: string, data: any, query?: Query): Promise<T> {

        const url = this.createUrl(path, query);
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                ...this.headers,
                'Content-Type': 'application/json'
            }
        }).then(r => parseInt(r.headers.get('Content-Length') ?? '0') ? r.json() : undefined).then(r => deepFreeze(r) as T);
    }

    public delete(path: string): Promise<void> {
        const url = this.createUrl(path);
        return fetch(url, { method: 'DELETE', headers: this.headers }).then(() => undefined);
    }

    private createUrl(path: string, query?: Query): string {
        const url = this.baseUrl + path;
        if (!query) { return url; }

        let qs = '';

        if (query instanceof URLSearchParams) {
            qs = query.toString();
        } else {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) { continue; }
                if (Array.isArray(value)) {
                    for (const v of value) {
                        params.append(key, v.toString());
                    }
                } else {
                    params.append(key, value.toString());
                }
            }
            qs = params.toString();
        }

        return `${path}?${qs}`;
    }

}

export interface RestConfig {
    baseUrl: `${'http' | 'https'}://${string}`,
    /** Used for IoT device authentication */
    authorization: `device ${string}`,
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
