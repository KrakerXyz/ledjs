import { getLatestById } from './getLatestById';
import { getPostProcessors } from './getPostProcessors';
import { getScriptById } from './getScriptById';
import { postPostProcessor } from './postPostProcessor';
import { getById } from './getById';
import { deleteById } from './deleteById';

export const postProcessorRoutes = [
    getPostProcessors,
    getLatestById,
    getScriptById,
    postPostProcessor,
    getById,
    deleteById,
];