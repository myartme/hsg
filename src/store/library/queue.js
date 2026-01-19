import {getDataLibrary, setDataLibrary} from "@/store";
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

export async function loadQueuePositions(isAppPath = false, isRecursive = false){
    const response = await getDataLibrary('script_character_priority', "", isAppPath)
    if(response?.isSuccess){
        queuePositions.value = response.content
        if(isRecursive){
            await saveQueuePositions()
        }
    } else {
        if(response?.error.code === 'ENOENT' && !isRecursive){
            await loadQueuePositions(!isAppPath,  true)
        }
    }
}

export async function saveQueuePositions() {
    await setDataLibrary('script_character_priority', "", queuePositions.value)
}