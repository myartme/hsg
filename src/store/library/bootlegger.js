import {getDataLibrary, setDataLibrary, getDataFromCloud} from "@/store";
import {bootlegger} from "@/store/library/state";

export async function loadBootlegger(){
    // First try to load from user data
    const response = await getDataLibrary('bootlegger', "", false)
    if(response?.isSuccess){
        console.log(`[Cloud] bootlegger loaded from LOCAL`)
        bootlegger.value = response.content
        return
    }

    // If not found, try to load from cloud (botc_bootlegger in sets folder)
    if(response?.error.code === 'ENOENT'){
        console.log(`[Cloud] bootlegger not found locally, loading from CLOUD...`)
        const cloudResponse = await getDataFromCloud('botc_bootlegger', 'sets')
        if(cloudResponse?.isSuccess){
            console.log(`[Cloud] bootlegger loaded from CLOUD ✓`)
            bootlegger.value = cloudResponse.content
            // Save to user data for future use
            await saveBootlegger()
        } else {
            console.error(`[Cloud] bootlegger failed to load from cloud:`, cloudResponse?.error)
        }
    }
}

export async function saveBootlegger() {
    await setDataLibrary('bootlegger', "", bootlegger.value)
}