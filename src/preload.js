// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
    'electronAPI',
    {
        writeToLibraryJson: (filename, folder, content, isAppPath) => {
            return ipcRenderer.invoke('saveContentLibrary', { filename, folder, content, isAppPath })
        },
        readFromLibraryJson: (filename, folder, isAppPath) => {
            return ipcRenderer.invoke('loadContentLibrary', { filename, folder, isAppPath })
        },
        deleteLibraryJson: (filename, folder) => {
            return ipcRenderer.invoke('deleteContentLibrary', { filename, folder })
        },


        writeToScriptJson: (filename, folder, content, isAppPath) => {
            return ipcRenderer.invoke('saveContentScript', { filename, folder, content, isAppPath })
        },
        readFromScriptJson: (filename, folder, isAppPath) => {
            return ipcRenderer.invoke('loadContentScript', { filename, folder, isAppPath })
        },
        deleteScriptJson: (filename, folder) => {
            return ipcRenderer.invoke('deleteContentScript', { filename, folder })
        },


        writeToScriptPdf: (filename, folder, content, isAppPath) => {
            return ipcRenderer.invoke('saveContentPrint', { filename, folder, content, isAppPath })
        },
        readFromScriptPdf: (filename, folder, isAppPath) => {
            return ipcRenderer.invoke('loadContentPrint', { filename, folder, isAppPath })
        },
        deleteScriptPdf: (filename, folder) => {
            return ipcRenderer.invoke('deleteContentPrint', { filename, folder })
        },

        writeToOptions: (content, isAppPath) => {
            return ipcRenderer.invoke('saveOptions', { content, isAppPath })
        },
        readFromOptions: (isAppPath) => {
            return ipcRenderer.invoke('loadOptions', { isAppPath })
        },
        deleteOptions: () => {
            return ipcRenderer.invoke('deleteOptions')
        },


        renameScriptFile: (oldFilename, newFilename, folder, isAppPath) => {
            return ipcRenderer.invoke('renameScriptFile', { oldFilename, newFilename, folder, isAppPath })
        },
        renamePdfFile: (oldFilename, newFilename, folder, isAppPath) => {
            return ipcRenderer.invoke('renamePdfFile', { oldFilename, newFilename, folder, isAppPath })
        },

        getBase64Image: (url) =>
            ipcRenderer.invoke('getBase64Image', url)
    }
)