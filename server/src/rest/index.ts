
import { animationRoutes } from './animations/index.js';
import { authRoutes } from './auth/index.js';
import { deviceRoutes } from './devices/index.js';
import { iotRoutes } from './iot/index.js';
import { postProcessorRoutes } from './post-processors/index.js';
import { configRoutes } from './script-configs/index.js';
import { strandRoutes } from './strands/index.js';

export const apiRoutes = [...deviceRoutes, ...animationRoutes, ...authRoutes, ...postProcessorRoutes, ...strandRoutes, ...iotRoutes, ...configRoutes];