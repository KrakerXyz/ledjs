import { createApp } from 'vue';
import { router } from './main.router';
import App from '@/components/App.vue';
import SpinnerVue from '@/components/global/Spinner.vue';
import ModalVue from '@/components/global/Modal.vue';
import ConfirmationModalVue from '@/components/global/ConfirmationModal.vue';
import CreatedVue from './components/global/Created.vue';

const vueApp = createApp(App);

vueApp.component('v-spinner', SpinnerVue);
vueApp.component('v-modal', ModalVue);
vueApp.component('v-confirmation-modal', ConfirmationModalVue);
vueApp.component('v-created', CreatedVue);

vueApp.use(router); //Needs come be inside the authorized section or the guards will cause a redirect 

vueApp.mount('#app');
