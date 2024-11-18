
<template>
    <div class="d-flex flex-column h-100">
        <div class="flex-grow-1 row g-0">
            <div class="col p-2">
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
                        <div class="list-group-item">
                            <div class="form-floating">
                                <select
                                    id="select-new"
                                    class="form-select"
                                    placeholder="*"
                                    @change="addSegment($event)"
                                >
                                    <option value=""></option>
                                    <option v-for="opt of newSegmentOptions" :key="opt.id" :value="opt.id">
                                        {{ opt.name }}
                                    </option>
                                </select>
                                <label for="select-new">New Segment</label>
                            </div>
                        </div>
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

                    <template v-if="selectedStrandSegment && selectedSegmentVm">
                        <div class="row g-0">
                            <div class="col">
                                <h3>{{ selectedSegmentVm.name }}</h3>
                            </div>
                            <div class="col-auto">
                                <button
                                    class="btn btn-link text-danger"
                                    @click="removeSegment(selectedSegmentVm)"
                                >
                                    <v-icon :icon="Icons.Trashcan"></v-icon>
                                </button>
                            </div>
                        </div>

                        <div class="form-floating">
                            <input
                                id="d-num"
                                class="form-control"
                                placeholder="*"
                                v-model.lazy.number="selectedStrandSegment.leds.num"
                            >
                            <label for="d-num"># LEDs</label>
                        </div>

                        <div class="form-floating">
                            <input
                                id="d-offset"
                                class="form-control"
                                placeholder="*"
                                v-model.lazy.number="selectedStrandSegment.leds.offset"
                            >
                            <label for="d-offset">Offset</label>
                        </div>
                    </template>
                </div>

                <div class="row">
                    <div class="col">
                        <button
                            @click="saveStrand()"
                            type="button"
                            class="btn btn-primary w-100"
                        >
                            Save
                        </button>
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-danger w-100" @click.once="deleteStrand()">
                            <v-icon :icon="Icons.Trashcan"></v-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { Id } from '$core/rest/model/Id';
import { assertTrue, restApi } from '$src/services';
import { computed, defineComponent, getCurrentInstance, reactive, ref } from 'vue';
import SegmentVue from './Segment.vue';
import { LedSegment } from '$src/services/animation/LedSegment';
import { RouteLocationRaw, useRoute } from 'vue-router';
import { SegmentInputType, Segment, strandToPost } from '$core/rest/model/Strand';
import { newId } from '$core/services/newId';
import { useRouteLocation, RouteName } from '$src/main.router';
import { Icons } from '../global/Icon.vue';

export default defineComponent({
    components: { Segment: SegmentVue },
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    async setup(props) {

        const route = useRoute();
        
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const animations = await restApi.animations.list(true);

        const postProcessors = await restApi.postProcessors.list(true);

        const strand = reactive(strandToPost(await restApi.strands.byId(props.strandId)));

        const strandLeds = ref(strand.numLeds);

        const selectedId = computed(() => route.query.selectedId as Id | undefined);
        const sab = computed(() => new SharedArrayBuffer(strandLeds.value * 4));

        const segments = computed(() => {
            const vms: SegmentVm[] = [];

            for(const seg of strand.segments) {

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

            console.log('Segments updated', vms);
            return vms;
        });

        const newSegmentOptions = computed<NewSegmentOption[]>(() => {
            const options = animations.map(x => ({ id: x.id, type: SegmentInputType.Animation, name: `${x.name} (Animation)` }));

            if (segments.value.length) {
                const ppOptions = postProcessors.map(x => ({ id: x.id, type: SegmentInputType.PostProcess, name: `${x.name} (Post Processor)` }));
                options.push(...ppOptions);
            }

            options.sort((a, b) => a.name.localeCompare(b.name));
            return options;
        });

        const addSegment = (event: Event) => {
            const select = event.target as HTMLSelectElement;
            if(!select.value) { return; }
            const opt = newSegmentOptions.value.find(x => x.id === select.value);
            if (!opt) { throw new Error('Invalid option'); }

            const seg: Segment = {
                id: newId(),
                type: opt.type,
                script: { id: opt.id, version: 'draft' },
                leds: { offset: 0, num: strandLeds.value }
            };

            strand.segments.push(seg);
            select.value = '';
        };

        const removeSegment = (seg: SegmentVm) => {
            const index = strand.segments.findIndex(x => x.id === seg.id);
            if (index === -1) { throw new Error('Segment not found'); }
            strand.segments.splice(index, 1);
        };
        
        const selectedStrandSegment = computed(() => strand.segments.find(x => x.id === selectedId.value));
        const selectedSegmentVm = computed(() => segments.value.find(x => x.id === selectedId.value));

        const saveStrand = async () => {
            await restApi.strands.save(strand);
        };

        const deleteStrand = async () => {
            await restApi.strands.delete(strand.id);
        };

        return { strandLeds, segments, newSegmentOptions, addSegment, removeSegment, selectedStrandSegment, selectedSegmentVm, Icons, saveStrand, deleteStrand };
    }
});

interface NewSegmentOption {
    id: Id,
    type: SegmentInputType,
    name: string,
}

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

/*
       
*/

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