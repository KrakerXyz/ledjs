import { animationRoutes } from './animations';
import { authRoutes } from './auth';
import { deviceRoutes } from './devices';
import { postProcessorRoutes } from './post-processors';

export const apiRoutes = [...deviceRoutes, ...animationRoutes, ...authRoutes, ...postProcessorRoutes];