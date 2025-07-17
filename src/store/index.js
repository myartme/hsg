import { defineStore } from 'pinia'
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

export const getBase64Image = async (url) => {
    return await window.electronAPI.getBase64Image(url)
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
