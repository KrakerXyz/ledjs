import { createApp } from 'vue';
import { router } from './main.router';
import App from '@/components/App.vue';
import Spinner from '@/components/global/Spinner.vue';

const vueApp = createApp(App);

vueApp.component('v-spinner', Spinner);

vueApp.use(router); //Needs come be inside the authorized section or the guards will cause a redirect 
vueApp.mount('#app');
