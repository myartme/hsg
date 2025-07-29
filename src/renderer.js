import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './pages/layouts/AppLayout.vue'
import JsonEditorVue from 'json-editor-vue'
import FloatingVue from 'floating-vue'
import './index.css';
import router from './router'
import 'vue-color/style.css';

createApp(App)
    .use(router)
    .use(createPinia())
    .use(FloatingVue)
    .use(JsonEditorVue)
    .mount('#app')