import { RouteHandler } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { GoogleToken } from 'netled';
import { UserDb } from '../db';
import { EnvKey, getRequiredConfig } from '../services';
import { v4 } from 'uuid';

export const googleToken: RouteHandler = async (req, res) => {
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
         audience: clientId
      });

      const payload = ticket.getPayload();
      if (!payload) { throw new Error('empty payload'); }

      if (!payload.email) {
         throw new Error('ticket did not contain an email address');
      }

      const userDb = new UserDb();

      let user = await userDb.byEmail(payload.email.toLocaleLowerCase());
      const isNewUser = !user;
      if (!user) {
         user = {
            id: v4(),
            email: payload.email,
            createdDate: Date.now(),
            lastSeen: Date.now()
         };
         await userDb.add(user);
         req.log.info('Created new google user %s', user.id);
      }

      const token = await res.jwtSign({ tokenId: v4() }, { subject: user.id });

      res.setCookie('jwt', token, {
         domain: req.hostname.split(':')[0],
         path: '/',
         secure: req.protocol === 'https',
         httpOnly: true, //Prevents scripts from accessing the cookie
         sameSite: true
      });

      res.status(isNewUser ? 201 : 200).send(user);

   } catch (e) {
      req.log.warn(e, 'Error validating google auth token',);
      res.status(401).send('Error during token/user validation');
      return;
   }

};