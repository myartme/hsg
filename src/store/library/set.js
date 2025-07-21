import {
    allData,
    activeSetIndex,
    metaSets,
    queuePositions,
    activeCharacter
} from "@/store/library/state";
import {deleteDataLibrary, getDataLibrary, setDataLibrary} from "@/store";
import {loadQueuePositions, saveQueuePositions} from "@/store/library/queue";
import {SET_INDEX} from "@/constants/other";
import {ROLES} from "@/constants/roles";
import {loadBootlegger, saveBootlegger} from "@/store/library/bootlegger";

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

export async function setSetValueFromFile(item, isAppPath = false, isRecursive = false){
     const response = await getDataLibrary(`${item.id}`, "sets", isAppPath)
     if(response?.isSuccess){
         const list = { meta: item, list: response.content }
         if(isRecursive){
             await saveSet(item.id, response.content)
         }

         return list
     } else {
         if(response?.error.code === 'ENOENT' && !isRecursive){
             return await setSetValueFromFile(item, !isAppPath, true)
         }
     }
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

    await saveSets()
    await saveSet(meta.id, list);

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

    await saveSet(sets.elem(activeSetIndex.value).meta.get().id, newList)
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
        }
    }

    await deleteDataLibrary(name, 'sets')
    await saveQueuePositions()
    await saveBootlegger()
    await getSetsFromFile()
    activeSetIndex.value = SET_INDEX.DEFAULT
}

export async function saveSet(name, content){
    await setDataLibrary(`${ name }`, "sets", content)
}

export async function getSetsFromFile(isAppPath = false, isRecursive = false){
    const response = await getDataLibrary('role_sets', "", isAppPath)
    if(response?.isSuccess){
        await setSetsValueFromFile(response.content)
        if(isRecursive){
            await saveSets()
        }
    } else {
        if(response?.error.code === 'ENOENT' && !isRecursive){
            await getSetsFromFile(!isAppPath, true)
        }
    }
}

export async function loadSets(){
    await getSetsFromFile()
    await loadQueuePositions()
    await loadBootlegger()
}

export async function saveSets() {
    await setDataLibrary('role_sets', "", metaSets.value)
}