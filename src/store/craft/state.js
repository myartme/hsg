import {computed, ref} from "vue";
import {EMPTY_SCRIPT, ROLES} from "@/constants/roles";
import {SET_INDEX, ZERO_VERSION} from "@/constants/other";

export const listWithParams = ref({})
export const characterListWithParams = ref({})
export const pdfListWithParams = ref(
    ROLES.reduce((acc, role) => {
        acc[role] = []
        return acc
    }, {})
)
export const pdfListElement = ref(null)
export const scriptList = ref([])
export const pdfMeta = ref(EMPTY_SCRIPT)
export const isOpenPdfOptions = ref(false)
export const activeScriptIndex = ref(SET_INDEX.DEFAULT)
export const activeVersion = ref(ZERO_VERSION)

export const isSavedScript = ref(false)

export const isWaitingOperation = ref(false)

export const isDeletingFromPdfCharacterList = ref(false)
export const activeScript = computed(() => scriptList.value[activeScriptIndex.value])

export const tags = ref([])

export const isEditScriptTags = ref(false)
export const isImportScript = ref(false)
export const filteredScriptListTags = ref([])
export const filteredScriptListCharacters = ref([])

