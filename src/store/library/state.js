import {computed, ref} from "vue";
import {SET_INDEX} from "@/constants/other";
import {ROLES} from "@/constants/roles";

export const allData = ref([])
export const activeSetIndex = ref(SET_INDEX.DEFAULT)
export const bootlegger = ref({})
export const queuePositions = ref({})

export const activeSet = computed(() =>
    allData.value[activeSetIndex.value])
export const activeMeta = computed(() =>
    activeSet.value?.meta ?? {})
export const activeList = computed(() =>
    activeSet.value?.list ?? {})
export const activeCharacter = ref(null)

export const metaSets = computed(() =>
    allData.value.map(i => i.meta).flat())
export const listSets = computed(() =>
    allData.value.map(i => i.list))

export const allListsAsOne = computed(() => {
    return Object.fromEntries(
        ROLES.map(role => [
            role,
            listSets.value.flatMap(set => set[role] || [])
        ])
    );
})