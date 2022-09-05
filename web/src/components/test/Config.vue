
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
    </div>
</template>

<script lang="ts">

import { computed, defineComponent, reactive, watch } from 'vue';

export default defineComponent({
    props: {
        // eslint-disable-next-line no-undef
        config: { type: Object as () => netled.IAnimationConfig, required: true }
    },
    emits: {
        // eslint-disable-next-line no-undef
        'update:settings': (s: netled.IAnimationConfigValues<any>) => !!s
    },
    setup(props, { emit }) {

        const fieldVms = computed<FieldVm[]>(() => {
            const vms: FieldVm[] = [];
            for(const key of Object.keys(props.config.fields)) {
                const meta = props.config.fields[key];
                vms.push({
                    field: key,
                    value: meta.default.toString(),
                    meta
                });
            }
            return reactive(vms);
        });

        watch(fieldVms, () => {
            
            // eslint-disable-next-line no-undef
            const settings: netled.IAnimationConfigValues<any> = {};

            for(const vm of fieldVms.value) {
                let value: string | number = vm.value || vm.meta.default.toString();
                if(vm.meta.type === 'int') {
                    value = parseInt(value);
                } else if(vm.meta.type === 'decimal') {
                    value = parseFloat(value);
                }
                (settings as any)[vm.field] = value;
            }

            emit('update:settings', settings);

        }, { deep: true });

        return { fieldVms };
    }
});

interface FieldVm {
    field: string;
    value: string;
    // eslint-disable-next-line no-undef
    meta: netled.IAnimationConfigField
}

</script>
