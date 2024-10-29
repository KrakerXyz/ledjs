<template>
    <div class="container h-100 shadow bg-white p-3 d-flex flex-column">
        <template v-if="device">
            <div class="row">
                <div class="col">
                    <h1>{{ device.name }}</h1>
                </div>
                <div class="col-auto d-flex align-items-center">
                    <button type="button" class="btn text-danger" @click="deleteConfirmation = true">
                        <i class="fal fa-trash-alt fa-lg"></i>
                    </button>
                </div>
            </div>

            <h3>Setup</h3>
            <div class="row">
                <div class="col">
                    <div class="form-floating">
                        <textarea
                            id="device-install"
                            class="form-control font-monospace"
                            placeholder="*"
                            readonly
                            :value="install"
                        ></textarea>
                        <label for="device-config">Install/Start</label>
                    </div>
                </div>
            </div>

            <h3 class="mt-3">
                Logs
            </h3>
            <device-view-logs class="flex-grow-1 shadow-sm rounded border-top" :device-id="deviceId"></device-view-logs>
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
import DeviceViewLogs from './DeviceViewLogs.vue';
import { type Id, type Device, DeviceRestClient } from '$core/index';
import { useRestClient } from '$src/services';

export default defineComponent({
    components: {
        DeviceViewLogs,
    },
    props: {
        deviceId: { type: String as () => Id, required: true },
    },
    async setup(props) {
        const router = useRouter();

        const device = ref<Device | null>(null);

        const restClient = useRestClient();
        const deviceClient = new DeviceRestClient(restClient);
        device.value = await deviceClient.byId(props.deviceId, true);

        const install = computed(() => {
            if (!device.value) {
                return '';
            }

            const textArr = ['sudo npm install -g @krakerxyz/netled-raspi', `\r\nsudo netled -i ${device.value.id} -s ${device.value.secret}`];

            if (window.location.hostname !== 'netled.io') {
                let port = window.location.port === '3000' ? '3001' : window.location.port;
                if (port) {
                    port = ':' + port;
                }
                const ssl = window.location.protocol === 'https' ? 's' : '';
                const a = `http${ssl}://${window.location.hostname}${port}`;
                const w = `ws${ssl}://${window.location.hostname}${port}`;
                textArr.push(` -a ${a} -w ${w}`);
            }

            return textArr.join();
        });

        const deleteConfirmation = ref(false);

        const deleteDevice = async () => {
            await deviceClient.delete(props.deviceId);
            router.replace({ name: 'device-list' });
        };

        return { device, deleteConfirmation, deleteDevice, install };
    },
});
</script>

<style lang="postcss" scoped>
   textarea {
      height: 7rem !important;
   }
</style>
