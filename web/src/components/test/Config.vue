
<template>
    <div class="mt-n3">
        <div v-for="vm of fieldVms" :key="vm.field" class="row mt-3">
            <div class="col">
                <div class="form-floating">
                    <input
                        :id="vm.field"
                        class="form-control"
                        placeholder="*"
                        v-model="vm.value"
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

import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        // eslint-disable-next-line no-undef
        config: { type: Object as () => netled.IAnimationConfig, required: true }
    },
    setup(props) {

        const fieldVms = computed<FieldVm[]>(() => {
            const vms: FieldVm[] = [];
            for(const key of Object.keys(props.config.fields)) {
                const meta = props.config.fields[key];
                vms.push({
                    field: key,
                    value: meta.default ?? null,
                    meta
                });
            }
            return vms;
        });

        return { fieldVms };
    }
});

interface FieldVm {
    field: string;
    value: string | number | boolean | null;
    // eslint-disable-next-line no-undef
    meta: netled.IAnimationConfigField
}

</script>
