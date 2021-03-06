import { DeviceHealthData, DeviceWsClient } from '@krakerxyz/netled-core';

export class HealthReporter {

    public constructor(private readonly _ws: DeviceWsClient) {
        setInterval(() => this.report(), 15_000);

    }

    private providers: Partial<Record<keyof DeviceHealthData, () => any>> = {};

    public addHealthData<K extends keyof DeviceHealthData>(type: K, provider: () => DeviceHealthData[K]) {
        this.providers[type] = provider;
    }

    private report() {

        if (!this._ws.isConnected) { return; }

        const dataEntries = Object.entries(this.providers).map(e => [e[0], e[1]()]).filter(e => e[1] !== undefined);
        if (!dataEntries.length) { return; }

        const data: DeviceHealthData = Object.fromEntries(dataEntries);
        this._ws.postMessage({
            type: 'health',
            data
        });
    }

}