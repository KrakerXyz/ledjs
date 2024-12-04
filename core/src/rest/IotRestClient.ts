import { IotServices } from './model/IotServices.js';
import { RestClient } from './RestClient.js';

export class IotRestClient {
    constructor(private readonly restClient: RestClient) { }

    public services(): Promise<IotServices> {
        return this.restClient.get<IotServices>('/api/iot/services');
    }
}