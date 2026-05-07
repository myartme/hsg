import {getDataLibrary, setDataLibrary, getDataFromCloud} from "@/store";
import {nightOrder} from "@/store/library/state";

export function normalizeNightOrderList(list, field) {
    return list
        .filter(el => el[field] >= 0)
        .sort((a, b) => a[field] - b[field])
        .map((el, idx) => ({ ...el, [field]: idx }))
}

export function normalizeNightOrder() {
    nightOrder.value.firstNight = normalizeNightOrderList(nightOrder.value.firstNight, 'firstNight')
    nightOrder.value.otherNight = normalizeNightOrderList(nightOrder.value.otherNight, 'otherNight')
}

export function addToNightOrder(element, field) {
    const list = nightOrder.value[field]
    const existingIdx = list.findIndex(el => el.id === element.id)

    // Трюк: value - 1 чтобы встать перед существующим с тем же номером
    const adjustedElement = { ...element, [field]: element[field] - 1 }

    if (existingIdx === -1) {
        list.push(adjustedElement)
    } else {
        list[existingIdx] = adjustedElement
    }

    nightOrder.value[field] = normalizeNightOrderList(list, field)
}

export function addManyToNightOrder(elements, field) {
    const list = nightOrder.value[field]

    for (const element of elements) {
        const existingIdx = list.findIndex(el => el.id === element.id)
        // Трюк: value - 0.5 чтобы встать перед существующим с тем же номером
        const adjustedElement = { ...element, [field]: element[field] - 0.5 }

        if (existingIdx === -1) {
            list.push(adjustedElement)
        } else {
            list[existingIdx] = adjustedElement
        }
    }

    // Одна нормализация в конце — дробные станут целыми
    nightOrder.value[field] = normalizeNightOrderList(list, field)
}

export function removeFromNightOrder(id) {
    const firstIdx = nightOrder.value.firstNight.findIndex(el => el.id === id)
    if (firstIdx !== -1) {
        nightOrder.value.firstNight.splice(firstIdx, 1)
        nightOrder.value.firstNight = normalizeNightOrderList(nightOrder.value.firstNight, 'firstNight')
    }

    const otherIdx = nightOrder.value.otherNight.findIndex(el => el.id === id)
    if (otherIdx !== -1) {
        nightOrder.value.otherNight.splice(otherIdx, 1)
        nightOrder.value.otherNight = normalizeNightOrderList(nightOrder.value.otherNight, 'otherNight')
    }
}

export async function loadFirstNightOrder(){
    await loadNightOrder("first_night_order", "firstNight")
}

export async function loadOtherNightOrder(){
    await loadNightOrder("other_night_order", "otherNight")
}

export async function saveNightOrder() {
    await setDataLibrary('first_night_order', "", nightOrder.value.firstNight)
    await setDataLibrary('other_night_order', "", nightOrder.value.otherNight)
}

async function loadNightOrder(fileName, elemName, isRecursive = false){
    // First try to load from user data
    const response = await getDataLibrary(fileName, "", false)
    if(response?.isSuccess){
        console.log(`[Cloud] ${fileName} loaded from LOCAL`)
        nightOrder.value[elemName] = response.content
        return
    }

    // If not found and not recursive, try to load from cloud
    if(response?.error.code === 'ENOENT' && !isRecursive){
        console.log(`[Cloud] ${fileName} not found locally, loading from CLOUD...`)
        const cloudResponse = await getDataFromCloud(fileName)
        if(cloudResponse?.isSuccess){
            console.log(`[Cloud] ${fileName} loaded from CLOUD ✓`)
            nightOrder.value[elemName] = cloudResponse.content
            // Save to user data for future use
            await setDataLibrary(fileName, "", cloudResponse.content)
        } else {
            console.error(`[Cloud] ${fileName} failed to load from cloud:`, cloudResponse?.error)
        }
    }
}