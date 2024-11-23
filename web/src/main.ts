/* eslint-disable vue/component-definition-name-casing */
import { createApp } from 'vue';
import { router } from './main.router';
import CreatedVue from './components/global/Created.vue';
import './services/authService';
import ConfirmationModalVue from './components/global/ConfirmationModal.vue';
import ModalVue from './components/global/Modal.vue';
import IconVue from './components/global/Icon.vue';
import App from './components/App.vue';

const vueApp = createApp(App);

vueApp.component('v-icon', IconVue);
vueApp.component('v-modal', ModalVue);
vueApp.component('v-confirmation-modal', ConfirmationModalVue);
vueApp.component('v-created', CreatedVue);

vueApp.use(router); //Needs come be inside the authorized section or the guards will cause a redirect 

vueApp.mount('#app');
