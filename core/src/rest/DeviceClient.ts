
export class DeviceClient {

}

export interface Device {
    id: string;
    userId: string;
    secret: string;
    created: number;
    isOnline: boolean;
}