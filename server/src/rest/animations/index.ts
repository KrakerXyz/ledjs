import { deleteById } from './deleteById.js';
import { getAnimations } from './getAnimations.js';
import { getById } from './getById.js';
import { getLatestById } from './getLatestById.js';
import { getScriptById } from './getScriptById.js';
import { postAnimation } from './postAnimation.js';


export const animationRoutes = [
    getAnimations,
    getLatestById,
    getScriptById,
    postAnimation,
    getById,
    deleteById
];