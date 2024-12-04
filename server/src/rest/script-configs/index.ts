import { deleteConfigById } from './deleteConfigById.js';
import { getConfigById } from './getConfigById.js';
import { getConfigs } from './getConfigs.js';
import { getConfigsByScriptId } from './getConfigsByScriptId.js';
import { postConfig } from './postConfig.js';

export const configRoutes = [
    getConfigs,
    postConfig,
    getConfigById,
    deleteConfigById,
    getConfigsByScriptId
];