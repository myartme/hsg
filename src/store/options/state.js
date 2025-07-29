import {ref} from "vue";

export const themes = ref({
    dark: 'dark',
    light: 'light'
})
export const appVersion= ref(1.5)
export const debugMode= ref(false)
export const theme = ref(themes.value.light)
export const tooltipDelay = ref({
    buttonShow: 0,
    buttonHide: 0,
    infoShow: 0,
    infoHide: 0,
    jinxesShow: 0,
    jinxesHide: 0
})
