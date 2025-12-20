import {ref} from "vue";

export const themes = ref({
    dark: 'dark',
    light: 'light'
})
export const languages = ref({
    en: 'en',
    ru: 'ru'
})
export const appVersion= ref(1.5)
export const debugMode= ref(false)
export const theme = ref(themes.value.light)
export const language = ref(languages.value.en)
export const tooltipDelay = ref({
    buttonShow: 0,
    buttonHide: 0,
    infoShow: 0,
    infoHide: 0,
    jinxesShow: 0,
    jinxesHide: 0
})
