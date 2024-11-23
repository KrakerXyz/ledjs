import { deleteById } from './deleteById.js';
import { deleteConfigById } from './deleteConfigById.js';
import { getAnimations } from './getAnimations.js';
import { getById } from './getById.js';
import { getConfigById } from './getConfigById.js';
import { getConfigs } from './getConfigs.js';
import { getConfigsByAnimationId } from './getConfigsByAnimationId.js';
import { getLatestById } from './getLatestById.js';
import { getScriptById } from './getScriptById.js';
import { postAnimation } from './postAnimation.js';
import { postConfig } from './postConfig.js';


export const animationRoutes = [
    getConfigs,
    getAnimations,
    getLatestById,
    getScriptById,
    postAnimation,
    postConfig,
    getConfigsByAnimationId,
    getById,
    getConfigById,
    deleteById,
    deleteConfigById
];