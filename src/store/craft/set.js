import {useLibraryStore} from "@/store/library";
import {listWithParams, pdfListWithParams, pdfMeta} from "@/store/craft/state";
import {EMPTY_SCRIPT, MAIN_ROLES, ROLES} from "@/constants/roles";
import {listSets, metaSets, queuePositions} from "@/store/library/state";
import {getImageFirstUrl} from "@/constants/other";

function updateListSets() {
    const isOfficialIndex = metaSets.value.findIndex(el => el.isOfficial)
    return listSets.value.reduce((acc, set, index) => {
        Object.entries(set).forEach(([team, list]) => {
            const updatedList = list
                .map(character => {
                    const queueCharacter = queuePositions.value[team]?.find(el => el.id === character.id);
                    const isMainRoles = MAIN_ROLES.includes(team)
                    if (!queueCharacter && isMainRoles) return null;

                    return {
                        ...character,
                        base64Image: getImageFirstUrl(character),
                        isOfficial: index === isOfficialIndex,
                        scriptCharacterPriority: isMainRoles ? queueCharacter.scriptCharacterPriority : 0
                    };
                })
                .filter(character => character !== null);
            acc[team] = [...(acc[team] || []), ...updatedList];
        });
        return acc;
    }, {});
}

export async function loadSets() {
    await useLibraryStore().loadSets()
    listWithParams.value = updateListSets()
}

export function resetMeta() {
    pdfListWithParams.value = ROLES.reduce((acc, role) => {
        acc[role] = []
        return acc
    }, {})
    pdfMeta.value = {...EMPTY_SCRIPT}
}