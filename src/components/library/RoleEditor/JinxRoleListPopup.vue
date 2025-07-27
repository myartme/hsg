<template>
  <popup-container
      v-if="isOpen"
      :is-input-visible="false"
      @close="emits('update:isOpen', false)">
    <template #header>
      <h2 class="text-xl font-bold title-theme">Select a Character</h2>
    </template>
    <template #content>
      <template v-for="(list, teamName) in groupedRoles">
        <div class="mb-4 mt-4">
          <h3 class="text-lg font-semibold capitalize title-theme">{{ teamName }}s</h3>
          <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
            <template v-for="char in list">
              <tooltip
                  :triggers="['hover', 'focus']"
                  placement="top"
                  :delay="{ show: tooltipDelay.jinxesShow, hide: tooltipDelay.jinxesHide }"
              >
                <template #default>
                  <div class="group cursor-pointer flex flex-col items-center rounded transition relative m-1 hover:bg-[color:var(--color-hover-bg)]"
                       @click="selectRole(char)"
                  >
                    <image-any-script :character="char" img-class="w-15 h-15 rounded" />
                    <span class="text-xs text-center mt-2 text-theme">{{ char.name }}</span>
                  </div>
                </template>
                <template #popper>
                  <div class="text-sm px-3 py-2 rounded max-w-xs bg-[color:var(--color-bg)] text-theme">
                    {{ char.ability }}
                  </div>
                </template>
              </tooltip>
            </template>
          </div>
        </div>
      </template>
    </template>
  </popup-container>
</template>
<script setup>
import ImageAnyScript from "@/components/ui/ImageAnyScript.vue";
import {ref, watch} from "vue";
import {MAIN_ROLES} from "@/constants/roles.js";
import { useLibraryStore } from "@/store/library";
import {storeToRefs} from "pinia";
import {Tooltip} from "floating-vue";
import PopupContainer from "@/components/PopupContainer.vue";
import {useOptionsStore} from "@/store/options";

const props = defineProps({
  isOpen: Boolean,
  jinxes: Array
})

const libraryStore = useLibraryStore()
const { activeCharacter, allListsAsOne } = storeToRefs(libraryStore)
const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)

const groupedRoles = ref(getRoleList())
const emits = defineEmits(['update:isOpen', 'roleIsSelected'])

const selectRole = (role) => {
  emits('roleIsSelected', role)
  emits('update:isOpen', false)
}

function getRoleList() {
  return Object.fromEntries(MAIN_ROLES.map(key => [
    key,
    allListsAsOne.value[key].filter(el =>
        el.id !== activeCharacter.value.id &&
        !props.jinxes.some(jinx => jinx.id === el.id))
        .sort((a, b) => a.name.localeCompare(b.name))
  ]))
}

watch(() => props.jinxes,() => {
  groupedRoles.value = getRoleList()
},{ immediate: true, deep: true })
</script>