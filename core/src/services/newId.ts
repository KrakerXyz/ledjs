

import { v4 } from 'uuid';
import type { Id } from '../rest/model/Id.js';

export function newId(): Id {
    return v4() as Id;
}