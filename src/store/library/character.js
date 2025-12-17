import {setDataLibrary} from "@/store";
import {sets, saveSet} from "@/store/library/set";
import {activeCharacter, activeList, activeMeta, activeSetIndex, queuePositions, nightOrder, bootlegger, allListsAsOne, allData} from "@/store/library/state";
import {saveQueuePositions} from "@/store/library/queue";
import {saveBootlegger} from "@/store/library/bootlegger";
import {debugMode} from "@/store/options/state";
import {useCraftStore} from "@/store/craft";
import {saveNightOrder, removeFromNightOrder} from "@/store/library/night_order";
import {getImageFirstUrl} from "@/constants/other";
import {ROLES} from "@/constants/roles";

/**
 * Находит персонажа по ID и возвращает его данные вместе с информацией о наборе
 */
function findCharacterById(characterId) {
    for (let setIdx = 0; setIdx < allData.value.length; setIdx++) {
        const set = allData.value[setIdx]
        if (!set?.list) continue

        for (const role of ROLES) {
            const characters = set.list[role] || []
            const charIdx = characters.findIndex(c => c.id === characterId)
            if (charIdx !== -1) {
                return {
                    character: characters[charIdx],
                    setIndex: setIdx,
                    team: role,
                    charIndex: charIdx,
                    isOfficial: set.meta?.isOfficial ?? false,
                    setMeta: set.meta
                }
            }
        }
    }
    return null
}

/**
 * Синхронизирует джинксы с другими неофициальными персонажами при сохранении
 * Когда персонаж A имеет джинкс с B, добавляем обратный джинкс B с A (если B не официальный)
 */
async function syncJinxesWithOtherCharacters(character, oldJinxes = []) {
    const currentJinxes = character.jinxes || []
    const currentJinxIds = new Set(currentJinxes.map(j => j.id))
    const oldJinxIds = new Set(oldJinxes.map(j => j.id))

    const setsToSave = new Set()

    // Обработка удалённых джинксов - удаляем обратные джинксы
    for (const oldJinx of oldJinxes) {
        if (!currentJinxIds.has(oldJinx.id)) {
            const targetInfo = findCharacterById(oldJinx.id)
            if (targetInfo && !targetInfo.isOfficial) {
                const targetChar = targetInfo.character
                if (targetChar.jinxes) {
                    const reverseIdx = targetChar.jinxes.findIndex(j => j.id === character.id)
                    if (reverseIdx !== -1) {
                        targetChar.jinxes.splice(reverseIdx, 1)
                        setsToSave.add(targetInfo.setIndex)
                    }
                }
            }
        }
    }

    // Обработка добавленных/обновлённых джинксов - добавляем/обновляем обратные
    for (const jinx of currentJinxes) {
        const targetInfo = findCharacterById(jinx.id)
        if (targetInfo && !targetInfo.isOfficial) {
            const targetChar = targetInfo.character

            // Создаём обратный джинкс
            const reverseJinx = {
                id: character.id,
                reason: jinx.reason,
                image: getImageFirstUrl(character),
                name: character.name,
                ability: character.ability
            }

            if (!targetChar.jinxes) {
                targetChar.jinxes = []
            }

            const existingIdx = targetChar.jinxes.findIndex(j => j.id === character.id)
            if (existingIdx !== -1) {
                // Обновляем существующий джинкс
                targetChar.jinxes[existingIdx] = reverseJinx
            } else {
                // Добавляем новый
                targetChar.jinxes.push(reverseJinx)
            }

            setsToSave.add(targetInfo.setIndex)
        }
    }

    // Сохраняем изменённые наборы
    for (const setIdx of setsToSave) {
        const set = allData.value[setIdx]
        if (set && !set.meta?.isOfficial) {
            await saveSet(set.meta.id, set.list)
        }
    }
}

function syncCharacterData(character) {
    const id = character.id
    const team = character.team
    const updatedFields = {
        name: character.name,
        ability: character.ability,
        image: getImageFirstUrl(character)
    }

    // queuePositions
    if (queuePositions.value[team]) {
        const queueIdx = queuePositions.value[team].findIndex(el => el.id === id)
        if (queueIdx !== -1) {
            Object.assign(queuePositions.value[team][queueIdx], updatedFields)
        }
    }

    // nightOrder
    const firstNightIdx = nightOrder.value.firstNight.findIndex(el => el.id === id)
    if (firstNightIdx !== -1) {
        Object.assign(nightOrder.value.firstNight[firstNightIdx], updatedFields)
    }
    const otherNightIdx = nightOrder.value.otherNight.findIndex(el => el.id === id)
    if (otherNightIdx !== -1) {
        Object.assign(nightOrder.value.otherNight[otherNightIdx], updatedFields)
    }

    // bootlegger
    if (bootlegger.value[team]) {
        const bootleggerIdx = bootlegger.value[team].findIndex(el => el.id === id)
        if (bootleggerIdx !== -1) {
            Object.assign(bootlegger.value[team][bootleggerIdx], updatedFields)
        }
    }

    // jinxes в других персонажах
    for (const role of ROLES) {
        const characters = allListsAsOne.value[role] || []
        for (const char of characters) {
            if (char.jinxes) {
                const jinxIdx = char.jinxes.findIndex(j => j.id === id)
                if (jinxIdx !== -1) {
                    Object.assign(char.jinxes[jinxIdx], updatedFields)
                }
            }
        }
    }
}

export async function saveActiveCharacter(content){
    const list = {...activeList.value}
    const team = content.team
    const index = list[team].findIndex(el => el.id === content.id)

    // Сохраняем старые джинксы до обновления для синхронизации
    const oldJinxes = index !== -1 ? (list[team][index].jinxes || []) : []

    if (index !== -1) {
        list[team][index] = content
    } else {
        list[team].push(content)
    }

    sets.elem(activeSetIndex.value).list.set(list)
    activeCharacter.value = content
    syncCharacterData(content)

    if(!(activeMeta.value.isOfficial && !debugMode)){
        await setDataLibrary(`${activeMeta.value.id}`, "sets", list)
        const craftStore = useCraftStore()
        await craftStore.loadScripts()
        await craftStore.updateCharacterDataInScripts(activeCharacter.value)
        await saveNightOrder()
        await saveQueuePositions()
    }

    // Синхронизируем джинксы с другими неофициальными персонажами
    await syncJinxesWithOtherCharacters(content, oldJinxes)

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

    removeFromNightOrder(activeCharacter.value.id)

    if(!activeMeta.value.isOfficial){
        await setDataLibrary(`${activeMeta.value.id}`, "sets", list)
        await saveNightOrder()
        await saveQueuePositions()
        await saveBootlegger()
    }

    activeCharacter.value = null;
}