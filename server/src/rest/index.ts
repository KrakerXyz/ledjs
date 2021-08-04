import { animationRoutes } from './animations';
import { authRoutes } from './auth';
import { deviceRoutes } from './devices';

export const apiRoutes = [...deviceRoutes, ...animationRoutes, ...authRoutes];