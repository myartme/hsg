import {getDataLibrary, setDataLibrary, getDataFromCloud} from "@/store";
import {queuePositions} from "@/store/library/state";
import {MAIN_ROLES} from "@/constants/roles";

export function normalizeQueuePositions() {
    for (const team of MAIN_ROLES) {
        if (queuePositions.value[team]) {
            queuePositions.value[team] = queuePositions.value[team]
                .sort((a, b) => a.scriptCharacterPriority - b.scriptCharacterPriority)
                .map((el, idx) => ({ ...el, scriptCharacterPriority: idx + 1 }))
        }
    }
}

export function addManyToQueuePositions(elements, team) {
    const list = queuePositions.value[team] || []

    for (const element of elements) {
        const existingIdx = list.findIndex(el => el.id === element.id)
        // Трюк: value - 0.5 чтобы встать перед существующим с тем же номером
        const adjustedElement = {
            ...element,
            scriptCharacterPriority: element.scriptCharacterPriority - 0.5
        }

        if (existingIdx === -1) {
            list.push(adjustedElement)
        } else {
            list[existingIdx] = adjustedElement
        }
    }

    // Нормализация — дробные станут целыми
    queuePositions.value[team] = list
        .sort((a, b) => a.scriptCharacterPriority - b.scriptCharacterPriority)
        .map((el, idx) => ({ ...el, scriptCharacterPriority: idx + 1 }))
}

export async function loadQueuePositions(){
    // First try to load from user data
    const response = await getDataLibrary('script_character_priority', "", false)
    if(response?.isSuccess){
        console.log(`[Cloud] script_character_priority loaded from LOCAL`)
        queuePositions.value = response.content
        return
    }

    // If not found, try to load from cloud
    if(response?.error.code === 'ENOENT'){
        console.log(`[Cloud] script_character_priority not found locally, loading from CLOUD...`)
        const cloudResponse = await getDataFromCloud('script_character_priority')
        if(cloudResponse?.isSuccess){
            console.log(`[Cloud] script_character_priority loaded from CLOUD ✓`)
            queuePositions.value = cloudResponse.content
            // Save to user data for future use
            await saveQueuePositions()
        } else {
            console.error(`[Cloud] script_character_priority failed to load from cloud:`, cloudResponse?.error)
        }
    }
}

export async function saveQueuePositions() {
    await setDataLibrary('script_character_priority', "", queuePositions.value)
}