import {createRouter, createWebHashHistory} from 'vue-router'
import CharacterLibrary from "@/pages/CharacterLibrary.vue";
import Scripts from "@/pages/Scripts.vue";
import EditScript from "@/pages/EditScript.vue";
import Options from "@/pages/Options.vue";

const routes = [
    { path: '/', redirect: { name: 'scriptList' } },
    { name: 'scriptList', path: '/scripts', component: Scripts },
    { name: 'library', path: '/library', component: CharacterLibrary },
    { name: 'scriptEdit', path: '/edit-scripts', component: EditScript },
    { name: 'options', path: '/options', component: Options },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router