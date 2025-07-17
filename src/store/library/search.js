import {getDataLibrary, setDataLibrary} from "@/store";
import {
    search
} from "@/store/library/state";

export async function loadSearch(isAppPath = false, isRecursive = false){
    const response = await getDataLibrary('search', "", isAppPath)
    if(response?.isSuccess){
        search.value = response.content
        if(isRecursive){
            await saveSearch()
        }
    } else {
        if(response?.error.code === 'ENOENT' && !isRecursive){
            await loadSearch(!isAppPath, true)
        }
    }
}

export async function saveSearch() {
    await setDataLibrary('search', "", search.value)
}