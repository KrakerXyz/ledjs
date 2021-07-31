import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import { DeviceDb } from '../db/DeviceDb';
import { RequestUser } from './RequestUser';

export class WebSocketManager {

    private _connections: WsConnection[] = [];

    public handler = async (socketStream: SocketStream, request: FastifyRequest) => {
        console.log('Incoming WS connection');

        socketStream.socket.on('close', () => {
            console.log('WS Disconnected');
            const index = this._connections.findIndex(x => x.socketStream === socketStream);
            this._connections.splice(index, 1);
        });

        socketStream.socket.on('message', (message: any) => {
            console.log('Received WS message' + message);
            const devices = this._connections.filter(x => x.type === 'device');
            if (!devices.length) { return; }
            console.log(`Relaying message to ${devices.length}`);
            devices.forEach(d => d.socketStream.socket.send(message));
        });


        let wsConnection: WsConnection | undefined;

        if (request.url.endsWith('/device')) {
            const authParts = request.headers?.authorization?.split(' ');

            if (!authParts) {
                throw new Error('Missing authorization header');
            }

            if (authParts.length !== 2) {
                throw new Error('Malformed authorization header');

            } else if (authParts[0].toLowerCase() !== 'basic') {
                throw new Error('Invalid scheme');
            }

            const tokenValue = Buffer.from(authParts[1], 'base64').toString();
            const tokenParts = tokenValue.split(':');
            if (tokenParts.length !== 2) {
                throw new Error('Malformed token value');
            }

            const deviceDb = new DeviceDb();
            const device = await deviceDb.byId(tokenParts[0]);
            if (device?.secret !== tokenParts[1]) {
                throw new Error('Invalid token');
            }

            throw new Error('Testing');

            // wsConnection = {
            //     type: 'device',
            //     id: device.id,
            //     socketStream
            // };
        } else {

            const user: RequestUser = request.user as RequestUser;

            if (!user?.id) { throw new Error('Authenticated user missing'); }

            wsConnection = {
                type: 'user',
                id: user.id,
                socketStream
            };

        }
        this._connections.push(wsConnection);

    }

}

// export function isAuthorizedWs(req: IncomingMessage): boolean {

//     if (req.url?.endsWith('/device')) {
//         const auth = req.headers.authorization;

//     } else if (req.url?.endsWith('/client')) {

//     }

//     return false;
// }

interface WsConnection {
    type: 'device' | 'user';
    id: string;
    socketStream: SocketStream;
}