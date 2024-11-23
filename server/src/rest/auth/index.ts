import { postGoogleJwt } from './postGoogleJwt.js';
import { postGoogleToken } from './postGoogleToken.js';

export const authRoutes = [postGoogleToken, postGoogleJwt];