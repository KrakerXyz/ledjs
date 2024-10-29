import { RouteOptions } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { v4 } from 'uuid';
import { GoogleToken, Id } from '../../../../core/src/index.js';
import { UserDb } from '../../db/UserDb.js';
import { getRequiredConfig, EnvKey } from '../../services/config.js';

export const postGoogleToken: RouteOptions = {
    method: 'POST',
    url: '/api/auth/google-token',
    handler: async (req, res) => {
        const googleToken = req.body as GoogleToken;

        if (!googleToken?.idToken) {
            res.status(400).send('Missing idToken');
            return;
        }

        const clientId = getRequiredConfig(EnvKey.GoogleClientId);

        const oauthClient = new OAuth2Client(clientId);

        try {
            const ticket = await oauthClient.verifyIdToken({
                idToken: googleToken.idToken,
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
            req.log.warn(e, 'Error validating google auth token');
            res.status(401).send('Error during token/user validation');
            return;
        }
    },
};
