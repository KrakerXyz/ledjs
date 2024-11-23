

<template>
    <span class="material-symbols-outlined">
        {{ icon }}
    </span>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        icon: {
            type: String as () => Icons,
            required: true,
        },
    },
    setup() {



        return {};
    }
});

export enum Icons {
    Spinner = 'progress_activity',
    Trashcan = 'delete',
    Play = 'play_arrow',
    Stop = 'check_box_outline_blank',
}

</script>
