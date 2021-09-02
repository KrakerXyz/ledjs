import { createApp } from 'vue';
import { router } from './main.router';
import App from '@/components/App.vue';
import Spinner from '@/components/global/Spinner.vue';
import Modal from '@/components/global/Modal.vue';
import ConfirmationModal from '@/components/global/ConfirmationModal.vue';

const vueApp = createApp(App);

vueApp.component('v-spinner', Spinner);
vueApp.component('v-modal', Modal);
vueApp.component('v-confirmation-modal', ConfirmationModal);

vueApp.use(router); //Needs come be inside the authorized section or the guards will cause a redirect 

vueApp.mount('#app');
