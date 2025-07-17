import { defineStore } from 'pinia'
import {
    appVersion,
    debugMode,
    theme,
    themes,
    tooltipDelay
} from "@/store/options/state";
import {getDataOptions, setDataOptions, deleteDataOptions} from "@/store";

export const useOptionsStore = defineStore('options', () => {
     async function getOptions(isAppPath = false, isRecursive = false){
        const response = await getDataOptions(isAppPath)
        if(response?.isSuccess){
            const options = response.content
            appVersion.value = options.appVersion
            debugMode.value = options.debugMode
            theme.value = options.theme
            tooltipDelay.value = { ...options.tooltip }
        } else {
            if(response?.error.code === 'ENOENT' && !isRecursive){
                await getOptions(!isAppPath, true)
            }
        }
    }

    async function setOptions(content) {
        if(content.theme){
            theme.value = content.theme
        }
        if(content.appVersion){
            appVersion.value = content.appVersion
        }
        if(content.debugMode){
            debugMode.value = content.debugMode
        }
        if(content.tooltipDelay){
            tooltipDelay.value = content.tooltipDelay
        }

        await setDataOptions({
            appVersion: appVersion.value,
            debugMode: debugMode.value,
            theme: theme.value,
            tooltip: tooltipDelay.value
        })
    }
    async function deleteOptions() {
        await deleteDataOptions()
    }

    return {
        appVersion,
        debugMode,
        theme,
        themes,
        tooltipDelay,

        getOptions,
        setOptions,
        deleteOptions
    }
})