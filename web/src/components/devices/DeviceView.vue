<template>
    <div class="container h-100 shadow bg-white p-3 d-flex flex-column">
        <template v-if="device">
            <div class="row">
                <div class="col">
                    <h1>{{ device.name }}</h1>
                </div>
                <div class="col-auto d-flex align-items-center">
                    <button type="button" class="btn text-danger" @click="deleteConfirmation = true">
                        <v-icon :icon="Icons.Trashcan"></v-icon>
                    </button>
                </div>
            </div>

            <h3>Setup</h3>
            <div class="row">
                <div class="col">
                    <div class="form-floating">
                        <textarea
                            id="device-dotEnv"
                            class="form-control font-monospace"
                            placeholder="*"
                            readonly
                            :value="dotEnv"
                        ></textarea>
                        <label for="device-config">.env</label>
                    </div>
                </div>
            </div>
        </template>

        <v-confirmation-modal v-if="deleteConfirmation" @cancel="deleteConfirmation = false" @confirm="deleteDevice()">
            Are you sure you want to delete this device?
        </v-confirmation-modal>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { type Device } from '$core/rest/DeviceRestClient';
import type { Id } from '$core/rest/model/Id';
import { Icons } from '../global/Icon.vue';
import { restApi } from '$src/services';

export default defineComponent({
    props: {
        deviceId: { type: String as () => Id, required: true },
    },
    async setup(props) {
        const router = useRouter();

        const device = ref<Device | null>(null);

        device.value = await restApi.devices.byId(props.deviceId);

        // const install = computed(() => {
        //     if (!device.value) {
        //         return '';
        //     }

        //     const textArr = ['sudo npm dotEnv -g @krakerxyz/netled-raspi', `\r\nsudo netled -i ${device.value.id} -s ${device.value.secret}`];

        //     if (window.location.hostname !== 'netled.io') {
        //         let port = window.location.port === '3000' ? '3001' : window.location.port;
        //         if (port) {
        //             port = ':' + port;
        //         }
        //         const ssl = window.location.protocol === 'https' ? 's' : '';
        //         const a = `http${ssl}://${window.location.hostname}${port}`;
        //         const w = `ws${ssl}://${window.location.hostname}${port}`;
        //         textArr.push(` -a ${a} -w ${w}`);
        //     }

        //     return textArr.join();
        // });

        const dotEnv = computed(() => {

            if(!device.value) {
                return undefined;
            }

            const port = window.location.port === '5173' ? '3001' : window.location.port;
            const host = `${window.location.protocol}//${window.location.hostname}${port ? `:${port}` : ''}`;

            const auth = btoa(`${device.value.id}:${device.value?.secret}`);

            const lines = [
                `LEDJS_HOST=${host}`,
                `LEDJS_AUTH=${auth}`,
            ];

            return lines.join('\n');
        })

        const deleteConfirmation = ref(false);

        const deleteDevice = async () => {
            await restApi.devices.delete(props.deviceId);
            router.replace({ name: 'device-list' });
        };

        return { device, deleteConfirmation, deleteDevice, dotEnv, Icons };
    },
});
</script>

<style lang="postcss" scoped>
   textarea {
      height: 7rem !important;
   }
</style>
