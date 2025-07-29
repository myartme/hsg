<template>
  <sector-container
      :name="instance?.type.name"
      :is-show-sticky="isCanSave">
    <template #sticky>
      <action-button
                     icon="save"
                     icon-size="w-6 h-6"
                     button-class="w-10 h-10"
                     :handle="save">
      </action-button>
      <action-button
                     icon="undo"
                     icon-size="w-7 h-7"
                     button-class="w-10 h-10"
                     :handle="undo" />
    </template>
    <template #header>
      <h2 class="text-2xl font-bold">{{ label }}</h2>
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,50%)_1fr] gap-4">
        <div>
          <simple-input
              @input="checkTitle"
              v-model:value="title"
              label="Tag"
              :errored="isVisibleError"
              error-text="Tag already exists"
              :maxlength="20"
              class="flex-1"
          />
          <div class="flex items-end gap-4 mt-2 mb-2">
            <simple-checkbox
                v-model:value="isEnabledColor"
                label="Custom color"
                info="Enable to set a custom color for the tag." />
            <button
                @click="addTag"
                :class="[
                  'ml-auto px-4 py-2 rounded-xl whitespace-nowrap text-theme border-[color:var(--color-border)]',
                  !title || isVisibleError
                    ? 'cursor-not-allowed bg-[color:var(--color-disable-bg)]'
                    : 'cursor-pointer text-theme bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]'
                ]"
            >Add</button>
          </div>
          <chrome-picker v-if="isEnabledColor" v-model="color" :disable-fields="true" />
        </div>
        <div class="mt-8 ml-5 text-lg">
          <div class="text-theme font-bold">All tags ({{ localTags.length }})</div>
          <div v-for="(tag, key) in localTags" :key="key" class="grid grid-cols-1 md:grid-cols-[minmax(0,90%)_1fr] hover:border-[color:var(--color-border)]">
            <p :class="{ 'text-theme' : !tag.customColor }"
               :style="tag.customColor ? { color: tag.customColor } : {}">
              {{ key + 1 }}. {{ tag.title }}
            </p>
            <button
                class="text-lg cursor-pointer text-[color:var(--color-error)] hover:text-[color:var(--color-button-hover-error)]"
                @click="removeTag(key)"
            >×</button>
          </div>
        </div>
      </div>
    </template>
  </sector-container>
</template>
<script setup>
import {getCurrentInstance, ref, watch} from "vue";
import ActionButton from "@/components/ui/ActionButton.vue";
import SimpleInput from "@/components/ui/SimpleInput.vue";
import SectorContainer from "@/components/SectorContainer.vue";
import {useIndexStore} from "@/store";
import {isEqual} from "lodash/lang";
import {DEFAULT_ACTION_BUTTON_ACTIVE_TIME} from "@/constants/other";
import {useCraftStore} from "@/store/craft";
import SimpleCheckbox from "@/components/ui/SimpleCheckbox.vue";
import {storeToRefs} from "pinia";
import {ChromePicker} from "vue-color";

defineOptions({
  name: 'edit-tags'
})

const props = defineProps({
  label: String
})
const instance = getCurrentInstance()
const craftStore = useCraftStore()
const { tags } = storeToRefs(craftStore)
const indexStore = useIndexStore()
const isCanSave = ref(false)
const isVisibleError = ref(false)
const title = ref('')
const isEnabledColor = ref(false)
const color = ref('000000')
const localTags = ref([])

function addTag(){
  if(isVisibleError.value) return

  localTags.value.push({
    title: title.value,
    customColor: isEnabledColor.value ? color.value : null
  })
  title.value = ''
  isEnabledColor.value = false
  color.value = '000000'
}

function removeTag(key){
  localTags.value.splice(key, 1)
}

function checkTitle(event) {
  const isDuplicate = localTags.value.some(el =>el.title === event.target.value)

  if (isDuplicate) {
    isVisibleError.value = true
    return
  }

  isVisibleError.value = false
}

function save(){
  try{
    craftStore.saveTags(localTags.value)
    tags.value = [...localTags.value]
    isCanSave.value = false
    indexStore.unfocusWindow()
    return true
  } catch (e){
    return false
  }
}

function undo(){
  try{
    localTags.value = [...tags.value]
    setTimeout(() => {
      isCanSave.value = false
      indexStore.unfocusWindow()
    }, DEFAULT_ACTION_BUTTON_ACTIVE_TIME)
    return true
  } catch (e){
    return false
  }
}

watch(isCanSave, (newVal) => {
  newVal ? indexStore.focusWindow(instance?.type.name) : indexStore.unfocusWindow()
})

watch(localTags, (val) => {
  isCanSave.value = !isEqual(tags.value, val)
}, {deep:true})

watch(tags, () => {
  localTags.value = [...tags.value]
}, {immediate:true})
</script>