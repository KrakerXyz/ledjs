
<template>
    <div class="mt-n3">
        <div v-for="e of Object.entries(config.fields)" :key="e[0]" class="row mt-3">
            <div class="col">
                <div class="form-floating">
                    <input
                        :id="e[0]"
                        class="form-control"
                        placeholder="*"
                        :value="settings[e[0]]"
                        @change="event => setValue(e[0], e[1], event.target)"
                    >
                    <label :for="e[0]">{{e[1].name}}</label>
                    <div v-if="e[1].description" class="form-text">
                        {{e[1].description}}
                    </div>
                </div>
            </div>
        </div>

        <h6 class="mt-3">
            Save/load config
        </h6>
        <div>
            <div class="form-floating">
                <select
                    id="saved-config"
                    class="form-select"
                    placeholder="*"
                    v-model="selectedConfigId"
                >
                    <option value="new">
                        - Save as new -
                    </option>

                    <option v-for="c of savedConfigs" :key="c.value" :value="c.value">
                        {{c.text}}
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

            <div class="mt-1">
                <button type="button" class="btn btn-primary w-100" @click="saveConfig()">
                    Save Config
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { useAnimationRestClient } from '@/services';
import { AnimationConfigPost, AnimationVersion, deepClone, Id, newId } from '@krakerxyz/netled-core';
import { defineComponent, ref, watch } from 'vue';

type SelectOption = { text: string, value: Id | 'new' };

export default defineComponent({
    props: {
        animation: { type: Object as () => { id: Id, version: AnimationVersion }, required: true },
        config: { type: Object as () => netled.IAnimationConfig, required: true }
    },
    emits: {
        'update:settings': (s: netled.IAnimationConfigValues) => !!s
    },
    async setup(props, { emit }) {
            
        let settings = ref<netled.IAnimationConfigValues>({});

        watch(props.config, c => {
            const newSettings: netled.IAnimationConfigValues = {};
            for (const k of Object.getOwnPropertyNames(c.fields)) {
                newSettings[k] = settings.value[k] ?? c.fields[k].default;
            }
            settings.value = newSettings;
        }, { immediate: true });

        const setValue = (key: string, e: netled.IAnimationConfigField, target: EventTarget | HTMLInputElement | null) => {
            if (!target) {
                return;
            }

            const input  = target as HTMLInputElement;
            let value: string | number = input.value || e.default;

            if (e.type === 'int') {
                value = parseInt(value.toString());
            } else if (e.type === 'decimal') {
                value = parseFloat(value.toString());
            }

            (settings.value as any)[key] = value;

            emit('update:settings', { ...settings.value });

        };

        const selectedConfigId = ref<Id | 'new'>();
        watch(selectedConfigId, id => {
            if (id === 'new') { return; }
            newConfigName.value = undefined;
            const config = existingConfigs.find(x => x.id === id);

            settings.value = config?.config as netled.IAnimationConfigValues<any> ?? {};
            emit('update:settings', { ...settings.value });
        });

        const animationClient = useAnimationRestClient();
        const existingConfigs = deepClone(await animationClient.config.list(props.animation.id, props.animation.version));
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

            const newConfig: AnimationConfigPost = {
                id: selectedConfigId.value === 'new' ? newId() : selectedConfigId.value!,
                name: selectedConfigId.value === 'new' ? newConfigName.value! : existingConfig!.text,
                animation: props.animation,
                config: settings.value,
            };

            await animationClient.config.save(newConfig);
            if (!existingConfig) {
                savedConfigs.value = [{ text: newConfig.name, value: newConfig.id }, ...savedConfigs.value].sort((a,b) => a.text.localeCompare(b.text));
            }
            selectedConfigId.value = newConfig.id;
            newConfigName.value = undefined;
        };

        return { savedConfigs, selectedConfigId, saveConfig, newConfigName, settings, setValue };
    }
});

</script>
