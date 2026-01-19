import {defineStore} from 'pinia'
import {ref} from "vue";
import {objectToPrettyJson} from "@/constants/other";

export const getDataLibrary = async (fileName, folder, isAppPath = false)=>
    await window.electronAPI.readFromLibraryJson(fileName, folder, isAppPath)
export const setDataLibrary = async (filename, folder, content, isAppPath = false)=>
    await window.electronAPI.writeToLibraryJson(filename, folder, objectToPrettyJson(content), isAppPath)
export const deleteDataLibrary = async (filename, folder)=>
    await window.electronAPI.deleteLibraryJson(filename, folder)


export const getDataScript = async (fileName, folder, isAppPath = false)=>
    await window.electronAPI.readFromScriptJson(fileName, folder, isAppPath)
export const setDataScript = async (filename, folder, content, isAppPath = false)=>
    await window.electronAPI.writeToScriptJson(filename, folder, objectToPrettyJson(content), isAppPath)
export const deleteDataScript = async (filename, folder)=>
    await window.electronAPI.deleteScriptJson(filename, folder)


export const getDataPrint = async (fileName, folder, isAppPath = false)=>
    await window.electronAPI.readFromScriptPdf(fileName, folder, isAppPath)
export const setDataPrint = async (filename, folder, content, isAppPath = false)=>
    await window.electronAPI.writeToScriptPdf(filename, folder, content, isAppPath)
export const deleteDataPrint = async (filename, folder)=>
    await window.electronAPI.deleteScriptPdf(filename, folder)


export const getDataOptions = async (isAppPath = false)=>
    await window.electronAPI.readFromOptions(isAppPath)
export const setDataOptions = async (content, isAppPath = false)=>
    await window.electronAPI.writeToOptions(objectToPrettyJson(content), isAppPath)
export const deleteDataOptions = async ()=>
    await window.electronAPI.deleteOptions()


export const renameScriptFile = async (oldFilename, newFilename, folder, isAppPath) => {
    return await window.electronAPI.renameScriptFile(oldFilename, newFilename, folder, isAppPath)
}
export const renamePdfFile = async (oldFilename, newFilename, folder, isAppPath) => {
    return await window.electronAPI.renamePdfFile(oldFilename, newFilename, folder, isAppPath)
}

export const getBase64Image = async (url, retries = 2) => {
    const fallback = 'images/icons/defaults/default_character.png'

    // Если URL пустой или undefined
    if (!url) {
        console.warn('getBase64Image: empty URL, using fallback')
        return fallback
    }

    // Если уже data: URL - возвращаем как есть
    if (url.startsWith('data:')) {
        return url
    }

    // Если локальный путь (не http/https) - читаем через Electron
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        const result = await window.electronAPI.getLocalImage(url)
        if (result.isSuccess) {
            return result.content
        }
        console.warn('getBase64Image: local image load failed:', url, result.error)
        return fallback
    }

    // Проверяем кеш
    const cached = await window.electronAPI.getCachedImage(url)
    if (cached.isSuccess) {
        return cached.content
    }

    // Загружаем из сети с retry
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const base64Data = await window.electronAPI.getBase64Image(url)
            // Сохраняем в кеш
            await window.electronAPI.saveCachedImage(url, base64Data)
            return base64Data
        } catch (error) {
            console.warn(`Image load failed (attempt ${attempt + 1}/${retries + 1}):`, url, error.message)
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
            }
        }
    }

    console.error('Image load failed, using fallback:', url)
    return fallback
}

export const clearImageCache = async () => {
    return await window.electronAPI.clearImageCache()
}

export const getImageCacheInfo = async () => {
    return await window.electronAPI.getImageCacheInfo()
}

export const openLink = async (url) => {
    return await window.electronAPI.openLink(url)
}

export const deleteAllData = async () => {
    return await window.electronAPI.deleteAllData()
}

export const useIndexStore = defineStore('index', () => {
    const isLocked = ref(false)
    const lockedSource = ref(null)

    function focusWindow(source = null) {
        isLocked.value = true
        lockedSource.value = source
    }

    function unfocusWindow() {
        isLocked.value = false
        lockedSource.value = null
    }

    return {
        isLocked,
        lockedSource,
        focusWindow,
        unfocusWindow
    }
})
