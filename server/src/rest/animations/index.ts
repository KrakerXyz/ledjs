import { getAnimationById } from './getAnimationById';
import { getAnimations } from './getAnimations';
import { getScriptById } from './getScriptById';
import { postAnimation } from './postAnimation';

export const animationRoutes = [getAnimations, getAnimationById, getScriptById, postAnimation];