import {getDataLibrary, setDataLibrary} from "@/store";
import {nightOrder} from "@/store/library/state";

export async function loadFirstNightOrder(isAppPath = false, isRecursive = false){
    await loadNightOrder("first_night_order", "firstNight", isAppPath, isRecursive)
}

export async function loadOtherNightOrder(isAppPath = false, isRecursive = false){
    await loadNightOrder("other_night_order", "otherNight", isAppPath, isRecursive)
}

export async function saveNightOrder() {
    await setDataLibrary('first_night_order', "", nightOrder.value.firstNight)
    await setDataLibrary('other_night_order', "", nightOrder.value.otherNight)
}

async function loadNightOrder(fileName, elemName, isAppPath = false, isRecursive = false){
    const response = await getDataLibrary(fileName, "", isAppPath)
    if(response?.isSuccess){
        nightOrder.value[elemName] = response.content
        if(isRecursive){
            await saveNightOrder()
        }
    } else {
        if(response?.error.code === 'ENOENT' && !isRecursive){
            await loadNightOrder(!isAppPath,  true)
        }
    }
}