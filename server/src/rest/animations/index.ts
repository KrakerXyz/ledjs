import { getLatestById } from './getLatestById';
import { getAnimations } from './getAnimations';
import { getConfigsByAnimationId } from './getConfigsByAnimationId';
import { getScriptById } from './getScriptById';
import { postAnimation } from './postAnimation';
import { postConfig } from './postConfig';
import { getById } from './getById';
import { getConfigById } from './getConfigById';
import { getConfigs } from './getConfigs';
import { deleteById } from './deleteById';
import { deleteConfigById } from './deleteConfigById';

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