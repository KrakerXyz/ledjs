
import { netledGlobal } from '$core/netledGlobal';

export function ensureNetledNamespace() {
    (globalThis as any).netled ??= netledGlobal;
}