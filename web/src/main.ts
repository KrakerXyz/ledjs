import { createApp } from 'vue';
import { router } from './main.router';
import App from '@/components/App.vue';

const vueApp = createApp(App);
vueApp.use(router); //Needs come be inside the authorized section or the guards will cause a redirect 
vueApp.mount('#app');
