
import type { Id } from './Id.js';
import type { ScriptVersion } from './ScriptVersion.js';

export type ScriptType = 'animation' | 'post-processor';

export interface ScriptConfig {
    readonly id: Id;
    readonly userId: Id;
    readonly type: ScriptType;
    readonly script: {
        id: Id;
        version: ScriptVersion;
    };
    name: string;
    description?: string | null;
    config: Record<string, number | string | boolean>;
}

export interface ScriptConfigSummary extends ScriptConfig {
    scriptName: string;
}

export type ScriptConfigPost = Omit<ScriptConfig, 'userId'>;