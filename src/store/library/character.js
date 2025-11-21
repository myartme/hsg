import {setDataLibrary} from "@/store";
import {sets} from "@/store/library/set";
import {activeCharacter, activeList, activeMeta, activeSetIndex, nightOrder, queuePositions} from "@/store/library/state";
import {saveQueuePositions} from "@/store/library/queue";
import {saveBootlegger} from "@/store/library/bootlegger";
import {debugMode} from "@/store/options/state";
import {useCraftStore} from "@/store/craft";
import {saveNightOrder} from "@/store/library/night_order";

export async function saveActiveCharacter(content){
    const list = {...activeList.value}
    const team = content.team
    const index = list[team].findIndex(el => el.id === content.id)

    if (index !== -1) {
        list[team][index] = content
    } else {
        list[team].push(content)
    }

    sets.elem(activeSetIndex.value).list.set(list)
    activeCharacter.value = content

    if(!(activeMeta.value.isOfficial && !debugMode)){
        await setDataLibrary(`${activeMeta.value.id}`, "sets", list)
        const craftStore = useCraftStore()
        await craftStore.loadScripts()
        await craftStore.updateCharacterDataInScripts(activeCharacter.value)
        await saveNightOrder()
        await saveQueuePositions()
    }

    await saveBootlegger()
}

export async function deleteActiveCharacter(){
    const list = {...activeList.value}
    const team = activeCharacter.value.team
    const index = list[team].findIndex(el => el.id === activeCharacter.value.id)

    if (index === -1) return

    list[team].splice(index, 1);
    sets.elem(activeSetIndex.value).list.set(list)

    if(!!queuePositions.value[team]) {
        const queueIndex = queuePositions.value[team]?.findIndex(el => el.id === activeCharacter.value.id)
        if (queueIndex !== -1) {
            queuePositions.value[team].splice(queueIndex, 1)
            queuePositions.value[team] = queuePositions.value[team]
                .map((el, idx) => ({
                    ...el,
                    scriptCharacterPriority: idx + 1,
                }))
        }
    }

    const nightOrderIndex = nightOrder.value?.findIndex(el => el.id === activeCharacter.value.id)
    if (nightOrderIndex !== -1) {
        nightOrder.value.splice(nightOrderIndex, 1)
        const normalized = nightOrder.value.map(el => ({ ...el }))
        const first = normalized
            .filter(el => el.firstNight > 0)
            .sort((a, b) => a.firstNight - b.firstNight)
        first.forEach((el, idx) => (el.firstNight = idx + 1))

        const other = normalized
            .filter(el => el.otherNight > 0)
            .sort((a, b) => a.otherNight - b.otherNight)
        other.forEach((el, idx) => (el.otherNight = idx + 1))

        nightOrder.value = normalized
    }

    if(!activeMeta.value.isOfficial){
        await setDataLibrary(`${activeMeta.value.id}`, "sets", list)
        await saveNightOrder()
        await saveQueuePositions()
        await saveBootlegger()
    }

    activeCharacter.value = null;
}