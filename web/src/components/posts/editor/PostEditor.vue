
<template>
    <div class="h-100 d-flex flex-column">
        <div class="flex-grow-1 container shadow bg-white p-3">
            <div class="row g-0 h-100">
                <!-- The positioning here was to get monaco to resize to fill the col. -->
                <div class="col position-relative">
                    <div id="editor-ide-container" class="h-100 w-100 position-absolute" />
                </div>

                <div class="col-3 col-right p-3">
                    <button type="button" class="btn btn-link p-0">
                        Test script
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { useMonacoEditor } from '@/components/animations/editor/monacoEditor';
import { defineComponent, getCurrentInstance } from 'vue';
import { defaultPostScript } from './defaultPostScript';

export default defineComponent({
    props: {
    },
    setup() {

        const componentInstance = getCurrentInstance();

        const { content } = useMonacoEditor(
            'editor-ide-container',
            {},
            componentInstance ?? undefined
        );

        content.value = defaultPostScript.join('\r\n');

        return {};
    }
});

</script>
