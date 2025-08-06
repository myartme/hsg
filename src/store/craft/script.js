import {deleteDataScript, getDataScript, renameScriptFile, renamePdfFile, setDataScript} from "@/store";
import {activeScriptIndex, activeVersion, pdfListWithParams, pdfMeta, scriptList, tags} from "@/store/craft/state";
import {deletePdf, fillPdfList} from "@/store/craft/pdf";
import {DEFAULT_VERSION, objectToPrettyJson} from "@/constants/other";
import {DEFAULT_SCRIPT_AUTHOR, EMPTY_IMPORT_SCRIPT} from "@/constants/roles";
import {isEmpty} from "lodash/lang";

export async function loadScripts() {
    const result = await getDataScript('scripts', '')
    if (result.isSuccess) {
        scriptList.value = result.content
    }
}

export async function loadScript(version, name) {
    return await getDataScript(version, name)
}

export async function loadScriptWithMetaFilling(version, name){
    const result = await loadScript(version, name)
    if (result.isSuccess) {
        const idx = result.content.find(el => el.id === '_meta')
        const scriptMeta = {...EMPTY_IMPORT_SCRIPT, ...result.content.splice(idx, 1)[0]}
        const generalMeta = scriptList.value.find(el => el.name === name)
        const listMeta = generalMeta?.list.find(el => el.version === version)
        pdfMeta.value = {
            ...generalMeta,
            ...scriptMeta,
            version: version,
            note: listMeta.note,
            different: checkMetaDifferent(scriptMeta, generalMeta)
        }
        fillPdfList(result.content)
    }
}

export async function saveCurrentScript() {
    const now = new Date();
    pdfMeta.value.date = now.toISOString()
    if(pdfMeta.value.author === DEFAULT_SCRIPT_AUTHOR || pdfMeta.value.author === ''){
        pdfMeta.value.author = 'Unknown'
    }
    if (activeScriptIndex.value >= 0) {
        const result = await getDataScript(activeVersion.value || DEFAULT_VERSION, pdfMeta.value.name)
        if (result.isSuccess) {
            const idxMeta = result.content.find(el => el.id === '_meta')
            result.content.splice(idxMeta, 1)
            const pdfList = Object.values(pdfListWithParams.value).flat()
            const sorted1 = sortScriptArray(formatArray(pdfList))
            const sorted2 = sortScriptArray(formatArray(result.content))
            const list = scriptList.value[activeScriptIndex.value].list
            if (!arraysEqual(sorted1, sorted2)) {
                pdfMeta.value.version = getNextVersion(list.at(-1).version)
                await saveScript(pdfMeta.value)
                pdfMeta.value.list.push(
                    getFormatScriptListElement(
                        now.toISOString(), {...pdfMeta.value, ...list, json:true }, getCurrentScriptContentToSaveFormat()
                    )
                )
                scriptList.value[activeScriptIndex.value] = filterScriptFileMeta(pdfMeta.value)
            } else {

                await saveScript(pdfMeta.value)
                pdfMeta.value.list = list.map(el => {
                    if(el.version === pdfMeta.value.version){
                        el = getFormatScriptListElement(
                            now.toISOString(), {...pdfMeta.value, ...list, json:true }, getCurrentScriptContentToSaveFormat()
                        )
                    }

                    return el
                })

                pdfMeta.value.version = list.at(-1).version
                scriptList.value[activeScriptIndex.value] = filterScriptFileMeta(pdfMeta.value)
            }
        } else {
            pdfMeta.value.version = DEFAULT_VERSION
            await saveScript(pdfMeta.value)
            pdfMeta.value = {
                ...pdfMeta.value,
                version: DEFAULT_VERSION,
                list: [
                    getFormatScriptListElement(
                        now.toISOString(), { ...pdfMeta.value, json:true }, getCurrentScriptContentToSaveFormat()
                    )
                ]
            }
            scriptList.value.push(filterScriptFileMeta(pdfMeta.value))
        }
    } else {
        pdfMeta.value.version = DEFAULT_VERSION
        await saveScript(pdfMeta.value)
        pdfMeta.value = {
            ...pdfMeta.value,
            version: DEFAULT_VERSION,
            list: [
                getFormatScriptListElement(
                    now.toISOString(), { ...pdfMeta.value, json:true }, getCurrentScriptContentToSaveFormat()
                )
            ]
        }
        scriptList.value.push(filterScriptFileMeta(pdfMeta.value))
    }

    await saveScripts()
}

export async function saveUpdateVersions(meta) {
    const idx = scriptList.value.findIndex(el => el.name === meta.name)
    if(idx !== -1){
        const elem = scriptList.value[idx]
        let version = DEFAULT_VERSION
        const updatedList = await Promise.all(
            elem.list.map(async (el, elIndex) => {
                if (elIndex > 0) {
                    version = getNextVersion(version);
                }
                const currentVersion = version

                if (currentVersion !== el.version) {
                    await renameScriptFile(el.version, currentVersion, elem.name);
                    await renamePdfFile(el.version, currentVersion, elem.name);
                }
                return { ...el, version: currentVersion }
            })
        )
        scriptList.value[idx] = {
            ...scriptList.value[idx],
            list: updatedList,
            version: version,
            date: new Date().toISOString()
        }

        await saveScripts()
    }
}

export async function saveUpdateMeta(meta) {
    const idx = scriptList.value.findIndex(el => el.name === meta.name)
    if(idx !== -1){
        scriptList.value[idx] = {...scriptList.value[idx], ...meta}
        await saveScripts()
    }
}

export async function saveImportScript(meta, content) {
    const now = new Date();
    const idx = scriptList.value.findIndex(el => el.name === meta.name)
    if(idx !== -1){
        const loadedMeta = scriptList.value[idx]
        const version = Math.max(
            ...loadedMeta.list
                .map(el => parseFloat(el.version))
                .filter(v => !isNaN(v))
        )
        meta = {...loadedMeta, ...meta, date: now.toISOString(), version: getNextVersion(version) }
        await setDataScript(meta.version, meta.name, [filterScriptMeta(meta), ...content])
        scriptList.value[idx] = {
            ...filterScriptFileMeta(meta),
            list: [...scriptList.value[idx].list, getFormatScriptListElement(now.toISOString(), {...meta, json: true}, content)]
        }
    } else {
        if(meta.author === ''){
            meta.author = DEFAULT_SCRIPT_AUTHOR
        }
        meta = {...meta, date: now.toISOString(), version: DEFAULT_VERSION}
        await setDataScript(meta.version, meta.name, [filterScriptMeta(meta), ...content])
        scriptList.value.push({
            ...filterScriptFileMeta(meta),
            version: DEFAULT_VERSION,
            list: [getFormatScriptListElement(now.toISOString(), {...meta, json: true}, content)]
        })
    }
    await saveScripts()
}

export function getJsonCurrentScriptContent(){
    return objectToPrettyJson([filterScriptMeta(pdfMeta.value), ...getCurrentScriptContentToSaveFormat()])
}

export async function deleteScripts(name) {
    const idx = scriptList.value.findIndex(el => el.name === name)
    for(const el of scriptList.value[idx].list){
        const scriptDelete = await deleteDataScript(el.version, name)
        if(scriptDelete.isSuccess){
            await deletePdf(el.version, name)
        }
    }
    scriptList.value.splice(idx, 1)
    await saveScripts()
}

export async function deleteScript(version, name) {
    const scriptDelete = await deleteDataScript(version, name)
    if(scriptDelete.isSuccess){
        await deletePdf(version, name)
        const idx = scriptList.value.findIndex(el => el.name === name)
        if(idx !== -1){
            if(scriptList.value[idx].list.length === 1){
                scriptList.value.splice(idx, 1)[0]
            } else {
                scriptList.value[idx].list = scriptList.value[idx].list.filter(el => el.version !== version)
            }
        }
        await saveScripts()
    }
}

async function saveScript(meta) {
    await saveScriptWithParams(meta.version, meta.name, [filterScriptMeta(meta), ...getCurrentScriptContentToSaveFormat()])
}

export async function saveScriptWithParams(version, name, content) {
    await setDataScript(version, name, content)
}

export async function saveScriptsList(list) {
    if(list.length !== scriptList.value.length) return
    await saveScripts(list)
}

export async function saveScripts(list = {}) {
    if(isEmpty(list)){
        list = scriptList.value
    }
    await setDataScript('scripts', '', list)
}

export async function loadTags() {
    const result = await getDataScript('script_tags', '')
    if (result.isSuccess) {
        tags.value = result.content
    }
}

export async function saveTags(content) {
    await setDataScript('script_tags', '', content)
}

function getNextVersion(version){
    return (Number(version) + 0.1).toFixed(1)
}

function getCurrentScriptContentToSaveFormat(){
    return Object.values(pdfListWithParams.value).flat().map(el => {
        if (el.isOfficial) {
            return { id: el.id }
        } else {
            delete el.base64Image
            delete el.isOfficial
            delete el.scriptCharacterPriority

            return el
        }
    })
}

function filterScriptFileMeta(meta){
    return {
        "author": meta?.author || "",
        "name": meta?.name || "",
        "date": meta?.date || "",
        "almanac": meta?.almanac || "",
        "logo": meta?.logo || "",
        "background": meta?.background || "",
        "hideTitle": meta?.hideTitle || false,
        "version": meta?.version || "",
        "tags": meta?.tags || [],
        "list": meta?.list || []
    }
}

function filterScriptMeta(meta){
    return {
        id: "_meta",
        ...(meta?.author ? { author: meta.author } : {}),
        ...(meta?.name ? { name: meta.name } : {}),
        ...(meta?.almanac ? { almanac: meta.almanac } : {}),
        ...(meta?.logo ? { logo: meta.logo } : {}),
        ...(meta?.background ? { background: meta.background } : {}),
        ...(meta?.hideTitle ? { hideTitle: meta.hideTitle } : {}),
        ...(Array.isArray(meta?.bootlegger) && meta.bootlegger.length ? { bootlegger: meta.bootlegger } : {})
    }
}

function getFormatScriptListElement(date, meta, characters = {}){
    return {
        date: date,
        note: meta.note || "",
        json: meta.json || false,
        pdf: meta.pdf || false,
        version: meta.version || "",
        characters: characters.map(el => {
            return el.id ? el.id : el
        })
    }
}

function formatArray(list) {
    return list.map(el => {
        if(el?.id){
            return el.id
        }
        if(typeof el === 'string'){
            return el
        }
    })
}

function checkMetaDifferent(firstMeta, secondMeta){
    const result = {
        author: {
            scriptValue: firstMeta.author || "",
            generalValue: secondMeta.author || ""
        },
        almanac: {
            scriptValue: firstMeta.almanac || "",
            generalValue:secondMeta.almanac || ""
        },
        hideTitle: {
            scriptValue: firstMeta.hideTitle || false,
            generalValue: secondMeta.hideTitle || false
        },
        logo: {
            scriptValue: firstMeta.logo || "",
            generalValue: secondMeta.logo || ""
        },
        background: {
            scriptValue: firstMeta.background || "",
            generalValue: secondMeta.background || ""
        }
    }

    return Object.fromEntries(
        Object.entries(result)
            .map(([key, value]) => [
                key,
                { ...value, isEqual: value.scriptValue === value.generalValue }
            ])
    )
}

function sortScriptArray(list) {
    return list.sort((a, b) => {
        return a > b ? 1 : a < b ? -1 : 0;
    });
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
}