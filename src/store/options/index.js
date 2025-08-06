import {defineStore, storeToRefs} from 'pinia'
import {
    appVersion,
    debugMode,
    theme,
    themes,
    tooltipDelay
} from "@/store/options/state";
import {getDataOptions, setDataOptions, deleteDataOptions} from "@/store";
import {useLibraryStore} from "@/store/library";
import {useCraftStore} from "@/store/craft";
import {objectToPrettyJson, toNormalizeString} from "@/constants/other";

export const useOptionsStore = defineStore('options', () => {
    async function importSets(data, withReplace){
        try {
            const libraryStore = useLibraryStore()
            const {metaSets, listSets, queuePositions, bootlegger} = storeToRefs(libraryStore)
            if (data.meta && data.list) {
                for (const [key, metaEl] of Object.entries(data.meta)) {
                    const idx = metaSets.value.findIndex(el => el.id === metaEl.id)
                    if (idx >= 0) {
                        if (withReplace) {
                            metaSets.value[idx] = metaEl
                            if (data.queuePosition) {
                                for (const [team, list] of Object.entries(data.queuePosition[key])) {
                                    list.forEach(el => {
                                        const listIdx = queuePositions.value[team].findIndex(queue => queue.id === el.id)
                                        if (listIdx >= 0) {
                                            queuePositions.value[team][listIdx] = el
                                        } else {
                                            queuePositions.value[team].push(el)
                                        }
                                    })
                                }
                            }
                            if (data.bootlegger) {
                                for (const [team, list] of Object.entries(data.bootlegger[key])) {
                                    list.forEach(el => {
                                        const listIdx = bootlegger.value[team].findIndex(boot => boot.id === el.id)
                                        if (listIdx >= 0) {
                                            bootlegger.value[team][listIdx] = el
                                        } else {
                                            bootlegger.value[team].push(el)
                                        }
                                    })
                                }
                            }
                            for (const [team, list] of Object.entries(data.list[key])) {
                                list.forEach(el => {
                                    const listIdx = listSets.value[idx][team].findIndex(character => character.id === el.id)
                                    if (listIdx >= 0) {
                                        listSets.value[idx][team][listIdx] = el
                                    } else {
                                        listSets.value[idx][team].push(el)
                                    }
                                })
                            }
                        } else {
                            for (const [team, list] of Object.entries(listSets.value[idx])) {
                                const idsInList = new Set(list.map(item => item.id))
                                const newItems = data.list[key][team].filter(item => !idsInList.has(item.id))
                                list.push(...newItems)
                                if (data.queuePosition && newItems.length > 0) {
                                    const newItems = data.queuePosition[key][team].filter(item => !idsInList.has(item.id))
                                    queuePositions.value[team].push(...newItems)
                                }
                                if (data.bootlegger && newItems.length > 0) {
                                    const newItems = data.bootlegger[key][team].filter(item => !idsInList.has(item.id))
                                    bootlegger.value[team].push(...newItems)
                                }
                            }
                        }
                    } else {
                        metaSets.value.push(metaEl)
                        if (data.queuePosition) {
                            for (const [team, list] of Object.entries(data.queuePosition[key])) {
                                queuePositions.value[team].push(...list)
                            }
                        }
                        if (data.bootlegger) {
                            for (const [team, list] of Object.entries(data.bootlegger[key])) {
                                bootlegger.value[team].push(...list)
                            }
                        }
                    }
                    await libraryStore.saveSet(metaEl.id, listSets.value[idx])
                }
            }
            await libraryStore.saveSets()
            await libraryStore.saveQueuePositions()
            await libraryStore.saveBootlegger()

            return true
        } catch {
            return false
        }
    }

    async function importScripts(data, withReplace){
        try {
            const craftStore = useCraftStore()
            const {scriptList} = storeToRefs(craftStore)

            for (const [key, metaEl] of Object.entries(data.meta)) {
                const idx = scriptList.value.findIndex(el => el.name === metaEl.name)
                if (idx >= 0) {
                    if (withReplace) {
                        for (const [listKey, list] of Object.entries(metaEl.list)) {
                            const versionIdx = scriptList.value[idx].list.findIndex(el => el.version === list.version)
                            if (versionIdx >= 0) {
                                scriptList.value[idx].list[versionIdx] = list
                            } else {
                                scriptList.value[idx].list.push(list)
                            }
                            await craftStore.saveScriptWithParams(list.version, scriptList.value[idx].name, data.list[key][listKey])
                        }
                    } else {
                        for (const [listKey, list] of Object.entries(metaEl.list)) {
                            const versionIdx = scriptList.value[idx].list.findIndex(el => el.version === list.version)
                            if (versionIdx === -1) {
                                scriptList.value[idx].list.push(list)
                                await craftStore.saveScriptWithParams(list.version, scriptList.value[idx].name, data.list[key][listKey])
                            }
                        }
                    }
                } else {
                    scriptList.value.push(metaEl)
                    for (const [listKey, list] of Object.entries(metaEl.list)) {
                        await craftStore.saveScriptWithParams(list.version, metaEl.name, data.list[key][listKey])
                    }
                }
            }
            await craftStore.saveScriptsList(scriptList.value)

            return true
        } catch(e) {
            console.log(e)
            return false
        }
    }

    async function importScriptTags(data, withReplace){
        try{
            if(!withReplace){
                const tags = await getTags()

                data.forEach(el => {
                    const exists = tags.some(tag => tag.title === el.title)
                    if (!exists) {
                        tags.push(el)
                    }
                })
                await setTags(tags)
            } else {
                await setTags(data)
            }
            return true
        } catch(e) {
            return false
        }
    }

    async function importOptions(data){
        try{
            await setOptions(data)
            return true
        } catch {
            return false
        }
    }

    async function exportData(data){
        let result = {}
        if(data.sets){
            result = {
                ...result,
                sets : getSets(data.sets)
            }
        }
        if(data.scripts){
            result = {
                ...result,
                scripts : await getScripts(data.scripts)
            }
        }
        if(data.options){
            result = {
                ...result,
                options : {
                    debugMode: debugMode.value,
                    theme: theme.value,
                    tooltip: tooltipDelay.value
                }
            }
        }

        if(data.scriptTags){
            result = {
                ...result,
                scriptTags : await getTags()
            }
        }
        return objectToPrettyJson(result)
    }

    function getSets(data){
        const libraryStore = useLibraryStore()
        const { allData, bootlegger, queuePositions } = storeToRefs(libraryStore)

        const result = {
            meta: [],
            list: [],
            queuePosition: [],
            bootlegger: []
        }

        data.forEach(el => {
            const setInfo = allData.value.find(set => set.meta?.id === el)
            const qp = Object.fromEntries(
                Object.entries(setInfo.list).map(([key, list]) => {
                    const result = list
                        .map(el => queuePositions.value[key]?.find(q => q.id === el.id))
                        .filter(Boolean)

                    return [key, result]
                })
            )

            const b = Object.fromEntries(
                Object.entries(setInfo.list).map(([key, list]) => {
                    const result = list
                        .map(el => bootlegger.value[key]?.find(q => q.id === el.id))
                        .filter(Boolean)

                    return [key, result]
                })
            )

            if(setInfo){
                result.meta.push(setInfo.meta)
                result.list.push(setInfo.list)
                result.queuePosition.push(qp)
                result.bootlegger.push(b)
            }
        })

        return result
    }

    async function getScripts(data){
        const craftStore = useCraftStore()
        const { scriptList } = storeToRefs(craftStore)

        const result = {
            meta: [],
            list: []
        }

        for (const el of data) {
            const setInfo = scriptList.value.find(set => toNormalizeString(set?.name) === el)
            if(setInfo){
                result.meta.push(setInfo)
                const promises = setInfo.list.map(async el => {
                    const result = await craftStore.loadScript(el.version, setInfo.name)
                    if(result.isSuccess){
                        return result.content
                    }
                })

                const lists = await Promise.all(promises)
                result.list.push(lists)
            }
        }
        return result
    }

    async function getOptions(isAppPath = false, isRecursive = false){
        const response = await getDataOptions(isAppPath)
        if(response?.isSuccess){
            const options = response.content
            debugMode.value = options.debugMode
            theme.value = options.theme
            tooltipDelay.value = { ...options.tooltip }
        } else {
            if(response?.error.code === 'ENOENT' && !isRecursive){
                await getOptions(!isAppPath, true)
            }
        }
    }

    async function getTags(){
        const craftStore = useCraftStore()
        const { tags } = storeToRefs(craftStore)
        await craftStore.loadTags()

        return tags.value
    }

    async function setTags(content) {
        const craftStore = useCraftStore()
        await craftStore.saveTags(content)
    }

    async function setOptions(content) {
        if(content.theme){
            theme.value = content.theme
        }
        if(content.debugMode){
            debugMode.value = content.debugMode
        }
        if(content.tooltipDelay){
            tooltipDelay.value = content.tooltipDelay
        }

        await setDataOptions({
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
        deleteOptions,
        exportData,
        importSets,
        importScripts,
        importScriptTags,
        importOptions
    }
})