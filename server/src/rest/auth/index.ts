import { postGoogleJwt } from './postGoogleJwt';
import { postGoogleToken } from './postGoogleToken';

export const authRoutes = [postGoogleToken, postGoogleJwt];