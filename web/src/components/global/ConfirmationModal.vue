
<template>
    <v-modal @close="response(false)">
        <slot></slot>

        <div class="row mt-4">
            <div class="col">
                <button class="btn btn-success w-100" @click="response(true)">Confirm</button>
            </div>
            <div class="col">
                <button class="btn btn-secondary w-100" @click="response(false)">Cancel</button>
            </div>
        </div>
    </v-modal>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    emits: {
        'cancel': () => true,
        'confirm': () => true,
        'response': (value: boolean) => value || true
    },
    setup(_, { emit }) {

        const response = (value: boolean) => {
            if (value) {
                emit('confirm');
            } else {
                emit('cancel');
            }

            emit('response', value);
        };


        return { response };
    }
});

</script>
