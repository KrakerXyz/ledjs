
<template>
    <div class="mt-n3">
        <div v-for="vm of fieldVms" :key="vm.field" class="row mt-3">
            <div class="col">
                <div class="form-floating">
                    <input
                        :id="vm.field"
                        class="form-control"
                        placeholder="*"
                        v-model.lazy="vm.value"
                    >
                    <label :for="vm.field">{{vm.meta.name}}</label>
                    <div v-if="vm.meta.description" class="form-text">
                        {{vm.meta.description}}
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
import { computed, defineComponent, reactive, ref, watch } from 'vue';

type SelectOption = { text: string, value: Id | 'new' };

export default defineComponent({
    props: {
        animation: { type: Object as () => { id: Id, version: AnimationVersion }, required: true },
        // eslint-disable-next-line no-undef
        config: { type: Object as () => netled.IAnimationConfig, required: true }
    },
    emits: {
        // eslint-disable-next-line no-undef
        'update:settings': (s: netled.IAnimationConfigValues<any>) => !!s
    },
    async setup(props, { emit }) {
            
        // eslint-disable-next-line no-undef
        let settings = ref<netled.IAnimationConfigValues<any>>({});

        const fieldVms = computed<FieldVm[]>(() => {
            const vms: FieldVm[] = [];
            for(const key of Object.keys(props.config.fields)) {
                const meta = props.config.fields[key];
                vms.push({
                    field: key,
                    value: (settings.value[key] ?? meta.default).toString(),
                    meta
                });
            }
            return reactive(vms);
        });

        watch(fieldVms, () => {

            for(const vm of fieldVms.value) {
                let value: string | number = vm.value || vm.meta.default.toString();
                if(vm.meta.type === 'int') {
                    value = parseInt(value);
                } else if(vm.meta.type === 'decimal') {
                    value = parseFloat(value);
                }
                (settings.value as any)[vm.field] = value;
            }

            emit('update:settings', settings.value);

        }, { deep: true });

        const selectedConfigId = ref<Id | 'new'>();
        watch(selectedConfigId, id => {
            if (id === 'new') { return; }
            newConfigName.value = undefined;
            const config = existingConfigs.find(x => x.id === id);
            // eslint-disable-next-line no-undef
            settings.value = config?.config as netled.IAnimationConfigValues<any> ?? {};
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

        return { fieldVms, savedConfigs, selectedConfigId, saveConfig, newConfigName };
    }
});

interface FieldVm {
    field: string;
    value: string;
    // eslint-disable-next-line no-undef
    meta: netled.IAnimationConfigField
}

</script>
