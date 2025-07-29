import {defineStore} from 'pinia'
import {
    isReadyToPrint,
    shouldStartPrintPreparation,
    triggerPrintPreparation,
    resetPrintPreparationTrigger,
    markReadyToPrint,
    waitForReadyToPrint,
} from "@/store/craft/print"
import {
    activeScript,
    activeScriptIndex,
    activeVersion,
    characterListWithParams,
    pdfListElement,
    pdfListWithParams,
    pdfMeta,
    scriptList,
    isOpenPdfOptions,
    isSavedScript,
    isWaitingOperation,
    isDeletingFromPdfCharacterList,
    tags,
    isEditScriptTags,
    isImportScript
} from "@/store/craft/state";
import {
    getJsonCurrentScriptContent,
    loadScript,
    loadScriptWithMetaFilling,
    loadScripts,
    saveCurrentScript,
    saveImportScript,
    deleteScript,
    deleteScripts,
    saveUpdateMeta,
    saveUpdateVersions,
    saveScriptsList,
    saveScriptWithParams,
    saveTags,
    loadTags
} from "@/store/craft/script";
import {
    addElementToFirstList,
    addElementToSecondList,
    deletePdf,
    loadPdf,
    savePdf
} from "@/store/craft/pdf";
import {
    loadSets,
    resetMeta
} from "@/store/craft/set";

export const useCraftStore = defineStore('craft', () => {

    return {
        pdfListWithParams,
        characterListWithParams,
        pdfListElement,
        scriptList,
        pdfMeta,
        isReadyToPrint,
        shouldStartPrintPreparation,
        activeScriptIndex,
        activeVersion,
        activeScript,
        isOpenPdfOptions,
        isSavedScript,
        isWaitingOperation,
        isDeletingFromPdfCharacterList,
        tags,
        isEditScriptTags,
        isImportScript,

        loadSets,
        addElementToFirstList,
        addElementToSecondList,
        saveTags,
        loadTags,
        loadScripts,
        loadScript,
        deleteScripts,
        saveUpdateMeta,
        deleteScript,
        loadScriptWithMetaFilling,
        saveUpdateVersions,
        savePdf,
        loadPdf,
        deletePdf,
        saveScriptWithParams,
        saveScriptsList,
        saveCurrentScript,
        saveImportScript,
        getJsonCurrentScriptContent,
        resetMeta,
        triggerPrintPreparation,
        resetPrintPreparationTrigger,
        markReadyToPrint,
        waitForReadyToPrint
    }
})
