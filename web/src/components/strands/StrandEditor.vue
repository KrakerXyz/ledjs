
<template>
    <div class="d-flex flex-column h-100">
        <div class="flex-grow-1 row g-0">
            <div class="col">
                <div class="h-100 d-flex flex-column">
                    <div class="list-group">
                        <router-link
                            v-for="seg of segments"
                            :key="seg.instanceId"
                            :to="seg.selectRoute"
                            class="list-group-item list-group-item-action"
                            :class="{ 'bg-info': seg.selected }"
                            active-class=""
                        >
                            <div :style="seg.style">
                                <Segment :segment="seg"></Segment>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 p-2 d-flex flex-column">
                <div class="flex-grow-1">
                    <h3>Setup</h3>
                    <div class="form-floating">
                        <input
                            id="d-leds"
                            class="form-control"
                            placeholder="*"
                            v-model.lazy.number="strandLeds"
                        >
                        <label for="d-leds"># LEDs</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { Id } from '$core/rest/model/Id';
import { assertTrue, useAnimationRestClient, usePostProcessorRestClient, useStrandRestClient } from '$src/services';
import { computed, defineComponent, getCurrentInstance, reactive, ref } from 'vue';
import SegmentVue from './Segment.vue';
import { LedSegment } from '$src/services/animation/LedSegment';
import { newId } from '$core/services/newId';
import { RouteLocationRaw, useRoute } from 'vue-router';
import { RouteName, useRouteLocation } from '$src/main.router';
import { SegmentInputType, Segment } from '$core/rest/model/Strand';

export default defineComponent({
    components: { Segment: SegmentVue },
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    async setup(props) {

        const route = useRoute();
        
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const mockSegments = getMockSegments();

        const animApi = useAnimationRestClient();
        const animations = await Promise.all(
            mockSegments
                .filter(x => x.type === SegmentInputType.Animation)
                .map(x => animApi.byId(x.script.id, x.script.version))
        );

        const postApi = usePostProcessorRestClient();
        const postProcessors = await Promise.all(
            mockSegments
                .filter(x => x.type === SegmentInputType.PostProcess)
                .map(x => postApi.byId(x.script.id, x.script.version))
        );

        const strandApi = useStrandRestClient();
        const strand = await strandApi.byId(props.strandId);

        const selectedId = computed(() => route.query.selectedId as Id | undefined);

        const strandLeds = ref(strand.numLeds);

        const sab = computed(() => new SharedArrayBuffer(strandLeds.value * 4));

        const segments = computed(() => {
            const vms: SegmentVm[] = [];

            for(const seg of mockSegments) {

                const animOrPost = seg.type === SegmentInputType.Animation
                    ? animations.find(y => y.id === seg.script.id && y.version === seg.script.version)
                    : postProcessors.find(y => y.id === seg.script.id && y.version === seg.script.version);

                if (!animOrPost) { throw new Error(`${seg.type} not found`); }

                const deadLeds = seg.type === SegmentInputType.Animation ? seg.leds.dead : undefined
                const ledSegment = new LedSegment(sab.value, seg.leds.num, seg.leds.offset, deadLeds);
                const style = { width: `${seg.leds.num / strandLeds.value * 100}%`, 'margin-left': `${seg.leds.offset / strandLeds.value * 100}%` };
                const selected = selectedId.value === seg.id;
                const vm: SegmentVm = { 
                    id: seg.id,
                    instanceId: newId(), // will intentionally force new components to be rendered until we make them reactive
                    name: animOrPost.name,
                    type: seg.type,
                    js: animOrPost.js,
                    style,
                    ledSegment,
                    prevLedSegment: vms.length ? vms[vms.length - 1].ledSegment : null,
                    selected,
                    selectRoute: useRouteLocation(RouteName.StrandEditor, { strandId: props.strandId }, {  selectedId: selected ? undefined : seg.id }),
                };

                vms.push(vm);
            };

            return vms;
        });

        return { segments, strandLeds };
    }
});

// these should not be exported. Just get TS to ignore warnings for now

export interface SegmentVm {
    id: Id,
    instanceId: string,
    name: string,
    type: SegmentInputType,
    js: string,
    style: Record<string, string>,
    ledSegment: LedSegment,
    prevLedSegment: LedSegment | null,
    selected: boolean,
    selectRoute: RouteLocationRaw,
}

export function getMockSegments() {
    const segments: Segment[] = reactive([]);

    segments.push({
        id: '37bddd85-6104-48dc-965c-dd69d490728f',
        type: SegmentInputType.Animation,
        script: {
            id: '3bfe1c99-c4fa-4eb2-a1c5-305d3729a35e',
            version: 'draft'
        },
        leds: {
            offset: 0,
            num: 50,
            dead: [4, 5, 6, '15-20']
        }
    });

    segments.push({
        id: '7aaa44c1-006b-4281-bdc3-66c60a7712fe',
        type: SegmentInputType.PostProcess,
        script: {
            id: 'b0197fb4-8645-4738-b2bc-e51a57170f99',
            version: 'draft'
        },
        leds: {
            offset: 0,
            num: 100
        }
    });
    return segments;
}



</script>

<style lang="postcss" scoped>
    .canvas-container :deep(canvas) {
        height: 20px;
    }
</style>