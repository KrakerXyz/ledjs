import { deleteById } from './deleteById.js';
import { getById } from './getById.js';
import { getStrands } from './getStrands.js';
import { postStrand } from './postStrand.js';


export const strandRoutes = [
    getStrands,
    postStrand,
    getById,
    deleteById,
];