import { getLatestById } from './getLatestById';
import { getAnimations } from './getAnimations';
import { getConfigsByAnimationId } from './getConfigsByAnimationId';
import { getScriptById } from './getScriptById';
import { postAnimation } from './postAnimation';
import { postConfig } from './postConfig';
import { getById } from './getById';
import { getConfigById } from './getConfigById';
import { getConfigs } from './getConfigs';

export const animationRoutes = [
    getAnimations,
    getLatestById,
    getScriptById,
    postAnimation,
    postConfig,
    getConfigsByAnimationId,
    getById,
    getConfigs,
    getConfigById,
];