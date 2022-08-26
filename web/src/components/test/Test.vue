
<template>
    <div>
        <LedCanvas ref="ledCanvas"></LedCanvas>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { LedArray } from './LedArray';
import LedCanvas from './LedCanvas.vue';
import { Script } from './Script';
import { Timer } from './Services';

export default defineComponent({
    components: { LedCanvas },
    setup() {
        const ledCanvas = ref<any>();

        const timer = new Timer();
        const sab = new SharedArrayBuffer(100 * 4);
        const ledArray = new LedArray(sab, () => {
            ledCanvas.value?.render(ledArray);
            return Promise.resolve();
        });

        const script = new Script(ledArray, timer);
        script.run();

        return { ledCanvas };
    },
});

</script>
