import { defineStore } from 'pinia'
import {
    activeMeta,
    activeSetIndex,
    activeList,
    activeCharacter,
    bootlegger,
    queuePositions,
    metaSets,
    listSets,
    allData,
    allListsAsOne,
    isEditCharacterLibrarySet,
    isCreateCharacterLibrary,
    isImportCharacterLibrary
} from "@/store/library/state";
import {
    deleteSet, getOriginalSets,
    loadSets, restoreSet,
    saveActiveSetWithList,
    saveActiveSetWithMeta, saveCharactersToList,
    saveNewMetaAndList, saveSet, saveSets
} from "@/store/library/set";
import {deleteActiveCharacter, saveActiveCharacter} from "@/store/library/character";
import {saveQueuePositions} from "@/store/library/queue";
import {saveBootlegger} from "@/store/library/bootlegger";

export const useLibraryStore = defineStore('library', () => {
    return {
        allData,
        activeSetIndex,
        activeMeta,
        activeList,
        activeCharacter,
        bootlegger,
        queuePositions,
        metaSets,
        listSets,
        allListsAsOne,
        isEditCharacterLibrarySet,
        isCreateCharacterLibrary,
        isImportCharacterLibrary,

        deleteSet,
        restoreSet,
        deleteActiveCharacter,
        loadSets,
        getOriginalSets,
        saveNewMetaAndList,
        saveActiveCharacter,
        saveActiveSetWithMeta,
        saveActiveSetWithList,
        saveCharactersToList,
        saveSet,
        saveSets,
        saveQueuePositions,
        saveBootlegger
    }
})