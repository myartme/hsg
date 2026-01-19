<template>
  <popup-container v-if="isOpen"
                   :is-input-visible="false"
                   @close="closeWindow">
    <template #header>
      <div class="flex items-center gap-2 pl-0 pb-1">
        <h2 class="text-xl font-bold title-theme">{{ $t('nightOrder.title') }}</h2>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="align-middle">
          <h2 class="text-lg font-semibold text-theme mb-2">{{ $t('nightOrder.firstNight') }}</h2>
          <div class="flex gap-4">
            <!-- Current -->
            <div class="flex flex-col items-center">
              <div class="h-6"></div>
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.current') }}</h3>
              <draggable-component v-model="firstNight" item-key="id" :move="checkMove">
                <template #item="{ element }">
                  <night-order-element :value="getElement(element)" :is-default-element="defaultNightArray.includes(element)" />
                </template>
              </draggable-component>
            </div>
            <!-- Last Save -->
            <div class="flex flex-col items-center">
              <action-button v-if="!isFirstNightSameAsSave"
                             icon="undoToSave"
                             icon-size="w-5 h-5"
                             button-class="w-6 h-6"
                             :tooltip="$t('tooltips.restoreToLastSave')"
                             :is-show-effect="true"
                             :handle="resetFirstNightToSave" />
              <div v-else class="h-6"></div>
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.lastSave') }}</h3>
              <div class="opacity-50 pointer-events-none">
                <night-order-element
                    v-for="element in getFirstNightLastSave()"
                    :key="element"
                    :value="getElement(element)"
                    :is-default-element="defaultNightArray.includes(element)" />
              </div>
            </div>
            <!-- Default -->
            <div class="flex flex-col items-center">
              <action-button v-if="!isFirstNightDefault"
                             icon="revert"
                             icon-size="w-5 h-5"
                             button-class="w-6 h-6"
                             :tooltip="$t('tooltips.restoreDefaultOrder')"
                             :is-show-effect="true"
                             :handle="() => firstNight = defaultResetFirstNight()" />
              <div v-else class="h-6"></div>
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.default') }}</h3>
              <div class="opacity-50 pointer-events-none">
                <night-order-element
                    v-for="element in defaultResetFirstNight()"
                    :key="element"
                    :value="getElement(element)"
                    :is-default-element="defaultNightArray.includes(element)" />
              </div>
            </div>
          </div>
        </div>
        <div class="align-middle">
          <h2 class="text-lg font-semibold text-theme mb-2">{{ $t('nightOrder.otherNights') }}</h2>
          <div class="flex gap-4">
            <!-- Current -->
            <div class="flex flex-col items-center">
              <div class="h-6"></div>
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.current') }}</h3>
              <draggable-component v-model="otherNight" item-key="id" :move="checkMove">
                <template #item="{ element }">
                  <night-order-element :value="getElement(element)" :is-default-element="defaultNightArray.includes(element)" />
                </template>
              </draggable-component>
            </div>
            <!-- Last Save -->
            <div class="flex flex-col items-center">
              <action-button v-if="!isOtherNightSameAsSave"
                             icon="undoToSave"
                             icon-size="w-5 h-5"
                             button-class="w-6 h-6"
                             :tooltip="$t('tooltips.restoreToLastSave')"
                             :is-show-effect="true"
                             :handle="resetOtherNightToSave" />
              <div v-else class="h-6"></div>
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.lastSave') }}</h3>
              <div class="opacity-50 pointer-events-none">
                <night-order-element
                    v-for="element in getOtherNightLastSave()"
                    :key="element"
                    :value="getElement(element)"
                    :is-default-element="defaultNightArray.includes(element)" />
              </div>
            </div>
            <!-- Default -->
            <div class="flex flex-col items-center">
              <action-button v-if="!isOtherNightDefault"
                             icon="revert"
                             icon-size="w-5 h-5"
                             button-class="w-6 h-6"
                             :tooltip="$t('tooltips.restoreDefaultOrder')"
                             :is-show-effect="true"
                             :handle="() => otherNight = defaultResetOtherNight()" />
              <div v-else class="h-6"></div>
              <h3 class="text-sm font-semibold text-theme opacity-70 mb-2">{{ $t('nightOrder.default') }}</h3>
              <div class="opacity-50 pointer-events-none">
                <night-order-element
                    v-for="element in defaultResetOtherNight()"
                    :key="element"
                    :value="getElement(element)"
                    :is-default-element="defaultNightArray.includes(element)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </popup-container>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useCraftStore} from "@/store/craft";
import PopupContainer from "@/components/PopupContainer.vue";
import {cloneDeep, isEmpty, isEqual} from "lodash/lang";
import draggableComponent from "vuedraggable";
import NightOrderElement from "@/components/craft/pdf/NightOrderElement.vue";
import {getImageFirstUrl} from "@/constants/other";
import ActionButton from "@/components/ui/ActionButton.vue";
import {pushState, ACTION_TYPES} from "@/store/craft/history";

const { t } = useI18n()

const props = defineProps({
  isOpen: Boolean
})

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams, isOpenNightOrder, isEditingScript, isSavedScript } = storeToRefs(craftStore)
const { getLastSaveFirstNight, getLastSaveOtherNight } = craftStore
const firstNight = ref([])
const otherNight = ref([])
const rolesList = ref()
const originalFirstNight = ref([])
const originalOtherNight = ref([])
const emits = defineEmits(['update:isOpen'])
const defaultNightArray = ['dusk', 'minioninfo', 'demoninfo', 'dawn']

const isFirstNightDefault = computed(() => isEqual(firstNight.value, defaultResetFirstNight()))
const isOtherNightDefault = computed(() => isEqual(otherNight.value, defaultResetOtherNight()))

const isFirstNightSameAsSave = computed(() => {
  return isEqual(firstNight.value, getLastSaveFirstNight())
})

const isOtherNightSameAsSave = computed(() => {
  return isEqual(otherNight.value, getLastSaveOtherNight())
})

function closeWindow(){
  const hasChanges = !isEqual(getLastSaveFirstNight(), firstNight.value) || !isEqual(getLastSaveOtherNight(), otherNight.value)
  if(hasChanges){
    // Save state for undo before applying changes
    pushState(ACTION_TYPES.CHANGE_NIGHT_ORDER, pdfMeta.value.name)
    isEditingScript.value = true
  }
  pdfMeta.value.firstNight = firstNight.value
  pdfMeta.value.otherNight = otherNight.value
  emits('update:isOpen', !props.isOpen)
}

function checkMove(evt) {
  const draggedElement = evt.draggedContext.element
  const futureIndex = evt.draggedContext.futureIndex

  // dusk должен оставаться первым
  if (draggedElement === 'dusk') return false
  // нельзя переместить на первую позицию (выше dusk)
  if (futureIndex === 0) return false

  return true
}

function getElement(element){
  if(defaultNightArray.includes(element)){
    return element
  } else {
    return getImageFirstUrl(rolesList.value.find(el => el.id === element))
  }
}

function defaultResetFirstNight(){
  if(isEmpty(rolesList.value)) return []
  return rolesList.value
      .filter(item => item.firstNight !== undefined)
      .sort((a, b) => a.firstNight - b.firstNight)
      .map(item => item.id)
}

function defaultResetOtherNight(){
  if(isEmpty(rolesList.value)) return []
  return rolesList.value
      .filter(item => item.otherNight !== undefined)
      .sort((a, b) => a.otherNight - b.otherNight)
      .map(item => item.id)
}

function resetFirstNightToSave(){
  firstNight.value = cloneDeep(getLastSaveFirstNight())
}

function resetOtherNightToSave(){
  otherNight.value = cloneDeep(getLastSaveOtherNight())
}

function getFirstNightLastSave(){
  return getLastSaveFirstNight()
}

function getOtherNightLastSave(){
  return getLastSaveOtherNight()
}

// Обновляем rolesList для отображения элементов
watch(pdfListWithParams, () => {
  rolesList.value = Object.values(pdfListWithParams.value).flat()
  rolesList.value = [
    ...rolesList.value,
    { id: 'dusk', firstNight: 0, otherNight: 0 },
    { id: 'minioninfo', firstNight: 13 },
    { id: 'demoninfo', firstNight: 18 },
    { id: 'dawn', firstNight: 10000, otherNight: 10000 }
  ]
}, { immediate: true, deep: true })

// Синхронизируем локальное состояние с pdfMeta при открытии попапа
watch(isOpenNightOrder, (isOpen) => {
  if (isOpen) {
    // Загружаем текущий порядок из pdfMeta
    firstNight.value = cloneDeep(pdfMeta.value.firstNight) || defaultResetFirstNight()
    otherNight.value = cloneDeep(pdfMeta.value.otherNight) || defaultResetOtherNight()

    // Сохраняем для сравнения (Last Save показывает сохранённое состояние)
    originalFirstNight.value = isSavedScript.value ? cloneDeep(pdfMeta.value.firstNight) || [] : []
    originalOtherNight.value = isSavedScript.value ? cloneDeep(pdfMeta.value.otherNight) || [] : []
  }
}, { immediate: true })
</script>