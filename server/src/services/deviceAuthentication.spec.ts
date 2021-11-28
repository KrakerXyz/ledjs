import { FastifyReply, FastifyRequest } from 'fastify';
import { deviceAuthentication } from '.';

describe('services', () => {

    describe('deviceAuthentication', () => {

        test('Auth header is required', async () => {

            const req: FastifyRequest = {

            } as any;

            let sentRes: any;
            const res: FastifyReply = {
                send: (x: any) => sentRes = x
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(sentRes).toBeInstanceOf(Error);
            expect(sentRes.toString()).toContain('Missing');

        });

        test('Auth header should be two string delimited by a space', async () => {

            const req: FastifyRequest = {
                headers: {
                    authorization: 'Malformed'
                }
            } as any;

            let sentRes: any;
            const res: FastifyReply = {
                send: (x: any) => sentRes = x
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(sentRes).toBeInstanceOf(Error);
            expect(sentRes.toString()).toContain('Malformed');
            expect(sentRes.toString()).toContain('header');

        });

        test('Auth header scheme should be basic', async () => {

            const req: FastifyRequest = {
                headers: {
                    authorization: 'Bearer foo'
                }
            } as any;

            let sentRes: any;
            const res: FastifyReply = {
                send: (x: any) => sentRes = x
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(sentRes).toBeInstanceOf(Error);
            expect(sentRes.toString()).toContain('scheme');

        });

        test('Handle invalid base64 data in auth header', async () => {

            const req: FastifyRequest = {
                headers: {
                    authorization: 'basic foo'
                }
            } as any;

            let sentRes: any;
            const res: FastifyReply = {
                send: (x: any) => sentRes = x
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(sentRes).toBeInstanceOf(Error);
            expect(sentRes.toString()).toContain('Malformed');
            expect(sentRes.toString()).toContain('token');

        });

        test('Token invalid if device not found', async () => {

            const req: FastifyRequest = {
                headers: {
                    authorization: `basic ${new Buffer('foo:bar').toString('base64')}`
                },
                services: {
                    deviceDb: {
                        byId: () => {
                            return null;
                        }
                    }
                }
            } as any;

            let sentRes: any;
            const res: FastifyReply = {
                send: (x: any) => sentRes = x
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(sentRes).toBeInstanceOf(Error);
            expect(sentRes.toString()).toContain('Invalid');
            expect(sentRes.toString()).toContain('token');

        });

        test('Token invalid if secrets do not match', async () => {

            const req: FastifyRequest = {
                headers: {
                    authorization: `basic ${new Buffer('foo:bar').toString('base64')}`
                },
                services: {
                    deviceDb: {
                        byId: () => {
                            return {
                                secret: 'not-bar'
                            };
                        }
                    }
                }
            } as any;

            let sentRes: any;
            const res: FastifyReply = {
                send: (x: any) => sentRes = x
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(sentRes).toBeInstanceOf(Error);
            expect(sentRes.toString()).toContain('Invalid');
            expect(sentRes.toString()).toContain('token');

        });

        test('Positive test', async () => {

            const req: FastifyRequest = {
                headers: {
                    authorization: `basic ${new Buffer('foo:bar').toString('base64')}`
                },
                services: {
                    deviceDb: {
                        byId: () => {
                            return {
                                id: 'yay',
                                secret: 'bar'
                            };
                        }
                    }
                }
            } as any;

            const res: FastifyReply = {
                send: () => {/**/ }
            } as any;

            await deviceAuthentication.bind({} as any)(req, res, () => {/**/ });

            expect(req.user).toBeTruthy();
            expect((req.user as any).sub).toBe('yay');

        });

    });

});