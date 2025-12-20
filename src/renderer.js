import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './components/layouts/AppLayout.vue'
import JsonEditorVue from 'json-editor-vue'
import FloatingVue from 'floating-vue'
import './index.css';
import router from './router'
import 'vue-color/style.css';
import clickOutside from './scripts/v-click-outside';
import i18n from './locales'

createApp(App)
    .use(router)
    .use(createPinia())
    .use(i18n)
    .use(FloatingVue)
    .use(JsonEditorVue)
    .directive('click-outside', clickOutside)
    .mount('#app')