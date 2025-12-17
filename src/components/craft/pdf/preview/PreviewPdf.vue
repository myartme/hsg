<template>
  <div class="w-[700px] pr-4 pl-4 pt-1 rounded-md overflow-auto relative bg-[color:var(--color-bg)] border-[color:var(--color-border)]">
    <div class="flex items-center gap-4 ml-8">
      <div class="w-[350px] overflow-hidden">
        <input
            v-if="isEditingName"
            ref="nameInputRef"
            v-model="editingName"
            maxlength="50"
            @blur="finishEditingName"
            @keydown.enter="finishEditingName"
            @keydown.escape="cancelEditingName"
            class="text-xl font-semibold font-serif w-full bg-transparent border border-[color:var(--color-border)] rounded px-1 outline-none uppercase title-theme"
        />
        <span
            v-else
            @click="startEditingName"
            class="text-xl font-semibold font-serif w-full truncate bg-transparent border border-transparent rounded outline-none uppercase title-theme cursor-pointer hover:border-[color:var(--color-border)]"
        >
          {{ trimmedName(pdfMeta.name, 25) }}
        </span>
      </div>
      <span class="ml-1 text-theme">by</span>
      <div class="w-[200px] overflow-hidden">
        <input
            v-if="isEditingAuthor"
            ref="authorInputRef"
            v-model="editingAuthor"
            maxlength="50"
            @blur="finishEditingAuthor"
            @keydown.enter="finishEditingAuthor"
            @keydown.escape="cancelEditingAuthor"
            class="text-lg font-serif w-full bg-transparent border border-[color:var(--color-border)] rounded px-1 outline-none title-theme"
        />
        <span
            v-else
            @click="startEditingAuthor"
            class="text-lg font-serif w-full truncate bg-transparent border border-transparent rounded outline-none title-theme cursor-pointer hover:border-[color:var(--color-border)]"
        >
          {{ trimmedName(pdfMeta.author, 18) }}
        </span>
      </div>
    </div>
    <div v-for="(group, team) in pdfListWithParams" :key="team">
      <team-list :team-name="team" :team-items="group" />
    </div>
  </div>
</template>
<script setup>
import TeamList from "@/components/craft/pdf/preview/TeamList.vue";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {nextTick, onMounted, ref} from "vue";
import {listWithParams, scriptList} from "@/store/craft/state";
import {isEmpty} from "lodash/lang";
import {DEFAULT_SCRIPT_AUTHOR, DEFAULT_SCRIPT_NAME} from "@/constants/roles";

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams } = storeToRefs(craftStore)

// Editing name
const isEditingName = ref(false)
const editingName = ref('')
const nameInputRef = ref(null)

// Editing author
const isEditingAuthor = ref(false)
const editingAuthor = ref('')
const authorInputRef = ref(null)

const trimmedName = (text, maxLength) => {
  return text.length > maxLength
      ? text.slice(0, maxLength - 1) + '…'
      : text
}

// Name editing functions
function startEditingName() {
  editingName.value = pdfMeta.value.name
  isEditingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

function finishEditingName() {
  const trimmed = editingName.value.trim()
  if (trimmed) {
    pdfMeta.value.name = trimmed
  }
  isEditingName.value = false
}

function cancelEditingName() {
  isEditingName.value = false
}

// Author editing functions
function startEditingAuthor() {
  editingAuthor.value = pdfMeta.value.author
  isEditingAuthor.value = true
  nextTick(() => {
    authorInputRef.value?.focus()
    authorInputRef.value?.select()
  })
}

function finishEditingAuthor() {
  const trimmed = editingAuthor.value.trim()
  if (trimmed) {
    pdfMeta.value.author = trimmed
  }
  isEditingAuthor.value = false
}

function cancelEditingAuthor() {
  isEditingAuthor.value = false
}

onMounted(async () => {
  if(isEmpty(listWithParams.value)){
    await craftStore.loadSets()
  }
  if(isEmpty(scriptList.value)){
    await craftStore.loadScripts()
  }
  if(!pdfMeta.value.name){
    pdfMeta.value.name = DEFAULT_SCRIPT_NAME
  }
  if(!pdfMeta.value.author){
    pdfMeta.value.author = DEFAULT_SCRIPT_AUTHOR
  }
})
</script>