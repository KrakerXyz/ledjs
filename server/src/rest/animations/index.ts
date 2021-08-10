import { getLatestById } from './getLatestById';
import { getAnimations } from './getAnimations';
import { getConfigs } from './getConfigs';
import { getScriptById } from './getScriptById';
import { postAnimation } from './postAnimation';
import { postConfig } from './postConfig';
import { getById } from './getById';
import { getConfigById } from './getConfigById';

export const animationRoutes = [getAnimations, getLatestById, getScriptById, postAnimation, postConfig, getConfigs, getById, getConfigById];