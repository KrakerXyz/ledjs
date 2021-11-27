import { Id } from '..';

import { v4 } from 'uuid';

export function newId(): Id {
    return v4() as Id;
}