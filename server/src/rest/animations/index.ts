import { getAnimationById } from './getAnimationById';
import { getAnimations } from './getAnimations';
import { getScriptById } from './getScriptById';
import { postAnimation } from './postAnimation';
import { postConfig } from './postConfig';

export const animationRoutes = [getAnimations, getAnimationById, getScriptById, postAnimation, postConfig];