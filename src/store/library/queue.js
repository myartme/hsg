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