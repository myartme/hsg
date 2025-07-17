import {getDataLibrary, setDataLibrary} from "@/store";
import {
    bootlegger
} from "@/store/library/state";

export async function loadBootlegger(isAppPath = false, isRecursive = false){
    const response = await getDataLibrary('bootlegger', "", isAppPath)
    if(response?.isSuccess){
        bootlegger.value = response.content
        if(isRecursive){
            await saveBootlegger()
        }
    } else {
        if(response?.error.code === 'ENOENT' && !isRecursive){
            await loadBootlegger(!isAppPath, true)
        }
    }
}

export async function saveBootlegger() {
    await setDataLibrary('bootlegger', "", bootlegger.value)
}