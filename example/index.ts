import { createApp } from 'vue';
import App from './App.vue';
import install from '../src/index';

const app = createApp(App);
app.use(install);
app.mount('#app');