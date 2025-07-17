import { defineStore } from 'pinia'
import {
    activeMeta,
    activeSetIndex,
    activeList,
    activeCharacter,
    search,
    bootlegger,
    queuePositions,
    metaSets,
    listSets,
    allData, allListsAsOne
} from "@/store/library/state";
import {
    deleteSet,
    loadSets,
    saveActiveSetWithList,
    saveActiveSetWithMeta, saveCharactersToList,
    saveNewMetaAndList
} from "@/store/library/set";
import {deleteActiveCharacter, saveActiveCharacter} from "@/store/library/character";

export const useLibraryStore = defineStore('library', () => {
    return {
        allData,
        activeSetIndex,
        activeMeta,
        activeList,
        activeCharacter,
        search,
        bootlegger,
        queuePositions,
        metaSets,
        listSets,
        allListsAsOne,

        deleteSet,
        deleteActiveCharacter,
        loadSets,
        saveNewMetaAndList,
        saveActiveCharacter,
        saveActiveSetWithMeta,
        saveActiveSetWithList,
        saveCharactersToList
    }
})