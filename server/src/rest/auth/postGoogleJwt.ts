import { RouteOptions } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { v4 } from 'uuid';
import { GoogleJwt, Id, User } from '@krakerxyz/netled-core';
import { UserDb } from '../../db';
import { EnvKey, getRequiredConfig } from '../../services';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

export const postGoogleJwt: RouteOptions = {
    method: 'POST',
    url: '/api/auth/google-jwt',
    schema: {
        body: jsonSchema<GoogleJwt>(),
        response: {
            '2xx': jsonSchema<User>(),
        },
    },
    handler: async (req, res) => {
        const googleJwt = req.body as GoogleJwt;

        const clientId = getRequiredConfig(EnvKey.GoogleClientId);

        const oauthClient = new OAuth2Client(clientId);

        try {
            const ticket = await oauthClient.verifyIdToken({
                idToken: googleJwt.jwt,
                audience: clientId,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('empty payload');
            }

            if (!payload.email) {
                throw new Error('ticket did not contain an email address');
            }

            const userDb = new UserDb();

            let user = await userDb.byEmail(payload.email.toLocaleLowerCase());
            const isNewUser = !user;
            if (!user) {
                user = {
                    id: v4() as Id,
                    email: payload.email,
                    created: Date.now(),
                    lastSeen: Date.now(),
                    avatarUrl: payload.picture ?? null
                };
                await userDb.add(user);
                req.log.info('Created new google user %s', user.id);
            } else {

                if (user.avatarUrl !== payload.picture) {
                    user.avatarUrl = payload.picture ?? null;
                    await userDb.replace(user);
                }

                await userDb.updateLastSeen(user.id);
            }

            const token = await res.jwtSign({}, { sub: user.id, jti: v4() });

            res.setCookie('jwt', token, {
                domain: req.hostname.split(':')[0],
                path: '/',
                secure: req.protocol === 'https',
                httpOnly: true, //Prevents scripts from accessing the cookie
                sameSite: true,
            });

            await res.status(isNewUser ? 201 : 200).send(user);
        } catch (e) {
            req.log.warn(e, 'Error validating google jwt');
            res.status(401).send('Error during google jwt/user validation');
            return;
        }
    },
};
