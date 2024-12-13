
<template>
    <div :class="{ 'mt-n3': !savedConfigOnly }">
        <template v-if="!savedConfigOnly">
            <div
                v-for="e of Object.entries(config)"
                :key="e[0]"
                class="row mt-3"
            >
                <div class="col">
                    <div class="form-floating">
                        <input
                            :id="e[0]"
                            class="form-control"
                            placeholder="*"
                            :value="settings[e[0]]"
                            @change="event => setValue(e[0], e[1], event.target)"
                        >
                        <label :for="e[0]">{{ e[1].name }}</label>
                        <div v-if="e[1].description" class="form-text">
                            {{ e[1].description }}
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <h6 v-if="!savedConfigOnly" class="mt-3">
            {{ readonly ? 'Load config' : 'Save/load config' }}
        </h6>
        <div>
            <div class="form-floating">
                <select
                    id="saved-config"
                    class="form-select"
                    placeholder="*"
                    v-model="selectedConfigId"
                >
                    <option v-if="!readonly" value="new">
                        - Save as new -
                    </option>

                    <option v-for="c of savedConfigs" :key="c.value" :value="c.value">
                        {{ c.text }}
                    </option>
                </select>
                <label for="saved-config">Configs</label>
            </div>

            <div v-if="selectedConfigId === 'new'" class="form-floating mt-1">
                <input
                    id="new-config-name"
                    class="form-control"
                    placeholder="*"
                    v-model="newConfigName"
                >
                <label for="new-config-name">New Config Name</label>
            </div>

            <div v-if="!readonly" class="mt-1">
                <button type="button" class="btn btn-primary w-100" @click="saveConfig()">
                    Save Config
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { Id } from '$core/rest/model/Id';
import { ScriptConfigPost, ScriptType } from '$core/rest/model/ScriptConfig';
import type { ScriptVersion } from '$core/rest/model/ScriptVersion';
import { deepClone } from '$core/services/deepClone';
import { newId } from '$core/services/newId';
import { restApi } from '$src/services/restClient';
import { defineComponent, ref, watch } from 'vue';

interface SelectOption { text: string, value: Id | 'new' }

export default defineComponent({
    props: {
        type: { type: String as () => ScriptType, required: true },
        script: { type: Object as () => { id: Id, version: ScriptVersion }, required: true },
        config: { type: Object as () => netled.common.IConfig, required: true },
        readonly: { type: Boolean, required: false },
        /** When true, only configs can be selected */
        savedConfigOnly: { type: Boolean, required: false }
    },
    emits: {
        'update:settings': (s: netled.common.ISettings) => !!s
    },
    async setup(props, { emit }) {

        const type = 'animation';
            
        let settings = ref<netled.common.ISettings>({});

        watch(props.config, c => {
            const newSettings: netled.common.ISettings = {};
            for (const k of Object.getOwnPropertyNames(c)) {
                newSettings[k] = settings.value[k] ?? c[k].default;
            }
            settings.value = newSettings;
        }, { immediate: true });

        const setValue = (key: string, e: netled.common.IConfigField, target: EventTarget | HTMLInputElement | null) => {
            if (!target) {
                return;
            }

            const input  = target as HTMLInputElement;
            let value: string | number | boolean = input.value || e.default;

            if (e.type === 'int') {
                value = parseInt(value.toString());
            } else if (e.type === 'decimal') {
                value = parseFloat(value.toString());
            } else if(e.type === 'boolean') {
                value = value === 'true';
            }

            (settings.value as any)[key] = value;

            emit('update:settings', { ...settings.value });

        };

        const selectedConfigId = ref<Id | 'new'>();
        watch(selectedConfigId, id => {
            if (id === 'new') { return; }
            newConfigName.value = undefined;
            const config = existingConfigs.find(x => x.id === id);

            settings.value = config?.config as netled.common.ISettings ?? {};
            emit('update:settings', { ...settings.value });
        });

        let existingConfigs = deepClone(await restApi.scriptConfigs.list(type, props.script.id, props.script.version));
        const savedConfigs = ref<SelectOption[]>(existingConfigs.map(x => ({ text: x.name, value: x.id })).sort((a, b) => a.text.localeCompare(b.text)));

        const newConfigName = ref<string>();

        const saveConfig = async () => {
            if (!selectedConfigId.value) {
                return;
            }

            if (selectedConfigId.value === 'new' && !newConfigName.value) {
                return;
            }
        
            const existingConfig = savedConfigs.value.find(x => x.value === selectedConfigId.value);

            const newConfig: ScriptConfigPost = {
                id: selectedConfigId.value === 'new' ? newId() : selectedConfigId.value!,
                name: selectedConfigId.value === 'new' ? newConfigName.value! : existingConfig!.text,
                type,
                script: props.script,
                config: settings.value,
            };

            await restApi.scriptConfigs.save(newConfig);
            if (!existingConfig) {
                savedConfigs.value = [{ text: newConfig.name, value: newConfig.id }, ...savedConfigs.value].sort((a,b) => a.text.localeCompare(b.text));
            }
            existingConfigs = deepClone(await restApi.scriptConfigs.list(type, props.script.id, props.script.version));
            selectedConfigId.value = newConfig.id;
            newConfigName.value = undefined;
        };

        return { savedConfigs, selectedConfigId, saveConfig, newConfigName, settings, setValue };
    }
});

</script>
