import {characterListWithParams, listWithParams, pdfListWithParams, pdfMeta} from "@/store/craft/state";
import {watch} from "vue";
import {isEmpty} from "lodash/lang";
import {deleteDataPrint, getDataPrint, setDataPrint} from "@/store";
import {saveScripts} from "@/store/craft/script";
import {toNormalizeString} from "@/constants/other";


export async function loadPdf(version, name) {
    const result = await getDataPrint(version, toNormalizeString(name))
    if (result.isSuccess) {
        return result.content
    }
}

export async function savePdf(content) {
    const result = await setDataPrint(pdfMeta.value.version, toNormalizeString(pdfMeta.value.name), content)
    if (result.isSuccess) {
        const index = pdfMeta.value.list.findIndex(el => el.version === pdfMeta.value.version)
        const list = pdfMeta.value.list[index]
        list.pdf = true
        pdfMeta.value.list[index] = list
        await saveScripts()
    }
}

export async function deletePdf(version, name) {
    return await deleteDataPrint(version, toNormalizeString(name))
}

export function fillPdfList(content) {
    return content.forEach(elContent => {
        const id = elContent.id ? elContent.id : elContent
        for (const [groupKey, groupArray] of Object.entries(characterListWithParams.value)) {
            const index = groupArray.findIndex(char => char.id === id);
            if (index !== -1) {
                addElementToSecondList(groupArray[index], groupKey, index)
                break;
            }
        }
    })
}

export function addElementToFirstList(element, team, key = -1) {
    if (key === -1) {
        key = pdfListWithParams.value[team].find(el => element.id === el.id)
    }
    pdfListWithParams.value[team].splice(key, 1)
    characterListWithParams.value[team].push(element)
    sortCharacterListWithParams()
    sortPdfListWithParams()
}

export function addElementToSecondList(element, team, key = -1) {
    if (key === -1) {
        key = characterListWithParams.value[team].findIndex(el => element.id === el.id)
    }
    characterListWithParams.value[team].splice(key, 1)
    pdfListWithParams.value[team].push(element)
    sortCharacterListWithParams()
    sortPdfListWithParams()
}

function sortCharacterListWithParams() {
    if (characterListWithParams.value) {
        if (!characterListWithParams.value) return
        characterListWithParams.value = Object.fromEntries(
            Object.entries(characterListWithParams.value).map(([key, list]) => {
                const sortedList = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                return [key, sortedList];
            })
        );
    }
}

function sortPdfListWithParams() {
    if (pdfListWithParams.value) {
        pdfListWithParams.value = Object.fromEntries(
            Object.entries(pdfListWithParams.value).map(([key, list]) => {
                const sortedList = [...list].sort((a, b) =>
                    a.scriptCharacterPriority - b.scriptCharacterPriority)
                return [key, sortedList];
            })
        );
    }
}

watch(listWithParams, () => {
    if (!isEmpty(listWithParams.value)) {
        characterListWithParams.value = {...listWithParams.value}
        sortCharacterListWithParams()
        sortPdfListWithParams()
    }
})