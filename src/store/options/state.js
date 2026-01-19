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
export const scriptEditorDefaultFilters = ref([])

export const pdfPrintDefaults = ref({
    // Travellers/Fabled/Loric (объединённая настройка)
    showTravellersFabledLoric: true,
    travellersFabledLoricDisplayMode: 'full', // 'full' | 'compact'

    // Таблица игроков
    showTable: true,

    // Номера страниц
    showPageNumbers: true,

    // Djinn (jinxes)
    showDjinn: true,
    djinnDisplayMode: 'full',

    // Bootlegger
    showBootlegger: true,
    bootleggerDisplayMode: 'full',

    // Порядок ночи
    showNightOrder: true,
    nightOrderDisplayMode: 'full',

    // Макет ролей
    roleColumns: 1, // 1 | 2
    rolesPerPage: 25, // 15-25 (для 1 столбца)
    rowsPerPage: 13 // 8-13 (для 2 столбцов)
})
