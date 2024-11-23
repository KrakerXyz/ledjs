import { deleteById } from './deleteById.js';
import { getById } from './getById.js';
import { getLatestById } from './getLatestById.js';
import { getPostProcessors } from './getPostProcessors.js';
import { getScriptById } from './getScriptById.js';
import { postPostProcessor } from './postPostProcessor.js';


export const postProcessorRoutes = [
    getPostProcessors,
    getLatestById,
    getScriptById,
    postPostProcessor,
    getById,
    deleteById,
];