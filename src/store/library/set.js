import {allData, activeSetIndex, metaSets, queuePositions, activeCharacter, bootlegger} from "@/store/library/state";
import {deleteDataLibrary, getDataLibrary, setDataLibrary, getDataFromCloud} from "@/store";
import {loadQueuePositions, saveQueuePositions, normalizeQueuePositions, addManyToQueuePositions} from "@/store/library/queue";
import {SET_INDEX, getImageFirstUrl} from "@/constants/other";
import {ROLES, MAIN_ROLES} from "@/constants/roles";
import {loadBootlegger, saveBootlegger} from "@/store/library/bootlegger";
import {loadFirstNightOrder, loadOtherNightOrder, saveNightOrder, addManyToNightOrder, removeFromNightOrder, normalizeNightOrder} from "@/store/library/night_order";

export const sets = {
    get: () =>
        allData.value,
    set: (value) => {
        allData.value = value.map(item => ({ ...item }))
    },
    add: (elem) => {
        allData.value.push({ ...elem })
    },
    reset: () => {
        allData.value = []
    },

    elem: (idx) => {
        const getSafe = (fn) => {
            try {
                return fn();
            } catch {
                return undefined;
            }
        };

        const setSafe = (fn) => {
            try {
                fn();
            } catch {

            }
        };
        const list = Object.fromEntries(ROLES.map(key => [
            key,
            {
                get: () => getSafe(() => allData.value[idx].list[key]),
                set: (value) => setSafe(() => {
                    allData.value[idx].list[key] = value;
                }),
            }
        ]));

        return {
            get: () => getSafe(() => allData.value[idx]),
            set: (value) => {
                if (allData.value[idx])
                    allData.value[idx] = value;
            },
            meta: {
                get: () => getSafe(() => allData.value[idx].meta),
                set: (value) => setSafe(() => {
                    allData.value[idx].meta = value;
                }),
            },
            list: {
                get: () => getSafe(() => allData.value[idx].list),
                set: (value) => setSafe(() => {
                    allData.value[idx].list = value;
                }),
                ...list
            }
        };
    }
}

export async function setSetsValueFromFile(content){
    const results = await Promise.all(
        content.map(async (item) => {
           return setSetValueFromFile(item)
        })
    )
    sets.set(results.filter(Boolean))
}

export async function setSetValueFromFile(item, isRecursive = false){
     // First try to load from user data
     const response = await getDataLibrary(`${item.id}`, "sets", false)
     if(response?.isSuccess){
         console.log(`[Cloud] Set "${item.id}" loaded from LOCAL`)
         return { meta: item, list: response.content }
     }

     // If not found and not recursive, try to load from cloud
     if(response?.error.code === 'ENOENT' && !isRecursive){
         console.log(`[Cloud] Set "${item.id}" not found locally, loading from CLOUD...`)
         const cloudResponse = await getDataFromCloud(item.id, 'sets')
         if(cloudResponse?.isSuccess){
             console.log(`[Cloud] Set "${item.id}" loaded from CLOUD ✓`)
             // Save to user data for future use
             await saveSet(item.id, cloudResponse.content)
             return { meta: item, list: cloudResponse.content }
         }
         console.error(`[Cloud] Set "${item.id}" failed to load from cloud:`, cloudResponse?.error)
     }

     return null
}

export async function saveNewMetaAndList(meta = {}, list = {}){
    if (activeSetIndex.value >= 0) return;

    const isCreate = activeSetIndex.value === SET_INDEX.CREATE;

    const elem = {
        meta,
        list: isCreate
            ? ROLES.reduce((acc, role) => { acc[role] = []; return acc }, {})
            : list
    };

    sets.add(elem);

    // Добавляем персонажей в queuePositions и nightOrder (как при импорте персонажей)
    if (!isCreate) {
        const firstNightElements = []
        const otherNightElements = []
        const queueElements = {}

        for (const team of ROLES) {
            const teamRoles = list[team] || []
            for (const role of teamRoles) {
                const baseElement = {
                    id: role.id,
                    image: getImageFirstUrl(role),
                    name: role.name,
                    ability: role.ability
                }

                if (role.firstNight > 0) {
                    firstNightElements.push({ ...baseElement, firstNight: role.firstNight })
                }
                if (role.otherNight > 0) {
                    otherNightElements.push({ ...baseElement, otherNight: role.otherNight })
                }

                if (MAIN_ROLES.includes(team)) {
                    const existingQueue = queuePositions.value[team]?.find(el => el.id === role.id)
                    if (!existingQueue) {
                        if (!queueElements[team]) {
                            queueElements[team] = []
                        }
                        queueElements[team].push({
                            ...baseElement,
                            scriptCharacterPriority: role.scriptCharacterPriority || 0
                        })
                    }
                }
            }
        }

        // Batch-вставка для nightOrder
        if (firstNightElements.length > 0) {
            addManyToNightOrder(firstNightElements, 'firstNight')
        }
        if (otherNightElements.length > 0) {
            addManyToNightOrder(otherNightElements, 'otherNight')
        }

        // Batch-вставка для queuePositions
        for (const team of Object.keys(queueElements)) {
            if (!queuePositions.value[team]) {
                queuePositions.value[team] = []
            }
            addManyToQueuePositions(queueElements[team], team)
        }
    }

    await saveSets()
    await saveSet(meta.id, list);

    if (!isCreate) {
        await saveNightOrder()
        await saveQueuePositions()
    }

    activeSetIndex.value = sets.get().findIndex(el => el.meta?.id === meta.id)
}

export async function saveCharactersToList(list){
    if(activeSetIndex.value < 0) return

    const currentList = sets.elem(activeSetIndex.value).list.get()
    const newList = ROLES.reduce((acc, role) => {
        acc[role] = [...(currentList[role] ?? []), ...(list[role] ?? [])]
        return acc
    }, {})
    sets.elem(activeSetIndex.value).list.set(newList)

    const firstNightElements = []
    const otherNightElements = []
    const queueElements = {}

    for (const team of ROLES) {
        const teamRoles = list[team] || []
        for (const role of teamRoles) {
            const baseElement = {
                id: role.id,
                image: getImageFirstUrl(role),
                name: role.name,
                ability: role.ability
            }

            if (role.firstNight > 0) {
                firstNightElements.push({ ...baseElement, firstNight: role.firstNight })
            }
            if (role.otherNight > 0) {
                otherNightElements.push({ ...baseElement, otherNight: role.otherNight })
            }

            if (MAIN_ROLES.includes(team)) {
                const existingQueue = queuePositions.value[team]?.find(el => el.id === role.id)
                if (!existingQueue) {
                    if (!queueElements[team]) {
                        queueElements[team] = []
                    }
                    queueElements[team].push({
                        ...baseElement,
                        scriptCharacterPriority: role.scriptCharacterPriority || 0
                    })
                }
            }
        }
    }

    // Batch-вставка для nightOrder
    if (firstNightElements.length > 0) {
        addManyToNightOrder(firstNightElements, 'firstNight')
    }
    if (otherNightElements.length > 0) {
        addManyToNightOrder(otherNightElements, 'otherNight')
    }

    // Batch-вставка для queuePositions
    for (const team of Object.keys(queueElements)) {
        if (!queuePositions.value[team]) {
            queuePositions.value[team] = []
        }
        addManyToQueuePositions(queueElements[team], team)
    }

    await saveSet(sets.elem(activeSetIndex.value).meta.get().id, newList)
    await saveNightOrder()
    await saveQueuePositions()
    activeCharacter.value = null
}

export async function saveActiveSetWithMeta(meta){
    if(activeSetIndex.value < 0) return

    sets.elem(activeSetIndex.value).meta.set(meta)
    await saveSets()
}

export async function saveActiveSetWithList(list){
    if(activeSetIndex.value < 0) return

    sets.elem(activeSetIndex.value).list.set(list)

    await saveSet(sets.elem(activeSetIndex.value).meta.get().id, list)
}

export async function deleteSet(name){
    const idx = metaSets.value.findIndex(el => el.id === name)
    if (idx === -1) return;

    const list = sets.elem(idx).list.get();
    for (const team of ROLES) {
        const teamRoles = list[team] || [];

        for (const role of teamRoles) {
            if(!!queuePositions.value[team]){
                const queueIndex = queuePositions.value[team]?.findIndex(el => el.id === role.id)
                if (queueIndex !== -1) {
                    queuePositions.value[team]?.splice(queueIndex, 1);
                }
            }
            if(!!bootlegger.value[team]){
                const bootleggerIndex = bootlegger.value[team]?.findIndex(el => el.id === role.id)
                if (bootleggerIndex !== -1) {
                    bootlegger.value[team]?.splice(bootleggerIndex, 1);
                }
            }

            removeFromNightOrder(role.id)
        }
    }

    normalizeNightOrder()
    normalizeQueuePositions()

    await deleteDataLibrary(name, 'sets')
    metaSets.value?.splice(idx, 1)
    await saveSets()
    await saveNightOrder()
    await saveQueuePositions()
    await saveBootlegger()
    await getSetsFromFile()
    activeSetIndex.value = SET_INDEX.DEFAULT
}

export async function restoreSet(set){
    const idx = metaSets.value.findIndex(el => el.id === set.id)
    if (idx !== -1) return

    // Load all data from cloud
    const setResponse = await getDataFromCloud(set.id, 'sets')
    const setContent = setResponse?.isSuccess ? setResponse.content : null

    const firstNightResponse = await getDataFromCloud('first_night_order')
    const firstNightContent = firstNightResponse?.isSuccess ? firstNightResponse.content : null

    const otherNightResponse = await getDataFromCloud('other_night_order')
    const otherNightContent = otherNightResponse?.isSuccess ? otherNightResponse.content : null

    const queueResponse = await getDataFromCloud('script_character_priority')
    const queueContent = queueResponse?.isSuccess ? queueResponse.content : null

    // Bootlegger might not be in cloud, try local first then cloud
    const bootleggerResponse = await getDataLibrary('bootlegger', "", true)
    const bootleggerContent = bootleggerResponse?.isSuccess ? bootleggerResponse.content : null

    if(setContent && queueContent && bootleggerContent && firstNightContent && otherNightContent){
        const firstNightElements = []
        const otherNightElements = []
        const queueElements = {}

        for (const team of ROLES) {
            const teamRoles = setContent[team] || [];

            for (const role of teamRoles) {
                const queueElement = queueContent[team]?.find(el => el.id === role.id)
                if (queueElement) {
                    if (!queueElements[team]) {
                        queueElements[team] = []
                    }
                    queueElements[team].push(queueElement)
                }

                const bootleggerElement = bootleggerContent[team]?.find(el => el.id === role.id)
                if (bootleggerElement) {
                    bootlegger.value[team].push(bootleggerElement)
                }

                const firstNightElement = firstNightContent?.find(el => el.id === role.id)
                if(firstNightElement){
                    firstNightElements.push(firstNightElement)
                }

                const otherNightElement = otherNightContent?.find(el => el.id === role.id)
                if(otherNightElement){
                    otherNightElements.push(otherNightElement)
                }
            }
        }

        // Batch-вставка для nightOrder
        if (firstNightElements.length > 0) {
            addManyToNightOrder(firstNightElements, 'firstNight')
        }
        if (otherNightElements.length > 0) {
            addManyToNightOrder(otherNightElements, 'otherNight')
        }

        // Batch-вставка для queuePositions
        for (const team of Object.keys(queueElements)) {
            if (!queuePositions.value[team]) {
                queuePositions.value[team] = []
            }
            addManyToQueuePositions(queueElements[team], team)
        }

        metaSets.value?.push(set)
        await saveSet(set.id, setContent)
        await saveSets()
        await saveNightOrder()
        await saveQueuePositions()
        await saveBootlegger()
        await getSetsFromFile()
    }

    /*await deleteDataLibrary(name, 'sets')
    metaSets.value?.splice(idx, 1)
    await saveSets()
    await saveQueuePositions()
    await saveBootlegger()
    await getSetsFromFile()
    activeSetIndex.value = SET_INDEX.DEFAULT*/
}

export async function saveSet(name, content){
    await setDataLibrary(`${ name }`, "sets", content)
}

export async function getSetsFromFile(isRecursive = false){
    // First try to load from user data
    const response = await getDataLibrary('role_sets', "", false)
    if(response?.isSuccess){
        console.log(`[Cloud] role_sets loaded from LOCAL`)
        await setSetsValueFromFile(response.content)
        return
    }

    // If not found and not recursive, try to load from cloud
    if(response?.error.code === 'ENOENT' && !isRecursive){
        console.log(`[Cloud] role_sets not found locally, loading from CLOUD...`)
        const cloudResponse = await getDataFromCloud('role_sets')
        if(cloudResponse?.isSuccess){
            console.log(`[Cloud] role_sets loaded from CLOUD ✓`)
            await setSetsValueFromFile(cloudResponse.content)
            // Save to user data for future use
            await saveSets()
        } else {
            console.error(`[Cloud] role_sets failed to load from cloud:`, cloudResponse?.error)
        }
    }
}

export async function getOriginalSets(){
    // Load original sets from cloud
    const response = await getDataFromCloud('role_sets')
    if(response?.isSuccess){
        return response.content
    }

    return null
}

export async function loadSets(){
    await getSetsFromFile()
    await loadFirstNightOrder()
    await loadOtherNightOrder()
    await loadQueuePositions()
    await loadBootlegger()
}

export async function saveSets() {
    await setDataLibrary('role_sets', "", metaSets.value)
}