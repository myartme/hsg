import {getDataLibrary, setDataLibrary} from "@/store";
import {
    queuePositions
} from "@/store/library/state";

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