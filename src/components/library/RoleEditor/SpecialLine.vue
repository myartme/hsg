<template>
  <div class="flex space-x-2">
    <div :class="[
        'flex space-x-5 pl-3 pr-3',
        { 'border-1 rounded-md': isSelectedElement }
        ]">
      <div><span>{{ keyElement + 1 }}.</span></div>
      <div v-if="type">
        <span class="text-[color:var(--color-button-error)]">type: </span>{{type}}
      </div>
      <div v-if="name">
        <span class="text-[color:var(--color-button-error)]">name: </span>{{name}}
      </div>
      <div v-if="time">
        <span class="text-[color:var(--color-button-error)]">time: </span>{{time}}
      </div>
      <div v-if="global">
        <span class="text-[color:var(--color-button-error)]">global: </span>{{global}}
      </div>
      <div v-if="value">
        <span class="text-[color:var(--color-button-error)]">value: </span>{{value}}
      </div>
    </div>
    <div class="flex space-x-2">
      <action-button
          icon="edit"
          icon-size="w-4 h-4"
          icon-color="fill-[color:var(--color-menu-active)]"
          icon-hover-color="group-hover:fill-[color:var(--color-button-active)]"
          button-class="w-7 h-7"
          :class="{'no-click': isShowConfirmDelete}"
          @click.stop="$emit('onEditing')" />
      <div class="relative inline-flex items-center">
        <action-button
            icon="cross"
            icon-size="w-4 h-4"
            icon-color="fill-[color:var(--color-error)]"
            icon-hover-color="group-hover:fill-[color:var(--color-button-error)]"
            button-class="w-7 h-7"
            :class="{'no-click': isShowConfirmDelete}"
            @click.stop="removeFeature" />
        <transition name="fade">
          <div
              v-if="isShowConfirmDelete"
              class="absolute right-[-80px] top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-[color:var(--color-bg)] border border-[color:var(--color-border)] rounded-lg px-3 py-1 shadow-lg"
          >
            <action-button
                icon="check"
                icon-size="w-3 h-3"
                icon-color="fill-[color:var(--color-button-success)] hover:fill-[color:var(--color-button-hover-success)]"
                wrapper-class=""
                @click.stop="confirmDelete" />
            <action-button
                icon="filledCross"
                icon-size="w-3 h-3"
                icon-color="fill-[color:var(--color-error)] hover:fill-[color:var(--color-button-error)]"
                wrapper-class=""
                @click.stop="declineDelete" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import { useLibraryStore } from "@/store/library";
import {useOptionsStore} from "@/store/options";
import ActionButton from "@/components/ui/ActionButton.vue";

const props = defineProps({
  special: Object,
  keyElement: Number,
  isSelected: {
    type: Boolean,
    default: false
  }
})

const type = ref('')
const name = ref('')
const time = ref('')
const global = ref('')
const value = ref('')
const isShowConfirmDelete = ref(false)
const isSelectedElement = computed(() => props.isSelected)
const emits = defineEmits(['onEditing', 'onWaitingAction', 'onDeleting'])

function editFeature(){
  emits('onEditing')
}
function removeFeature() {
  isShowConfirmDelete.value = true
  emits('onWaitingAction', props.keyElement)
}

function confirmDelete(){
  isShowConfirmDelete.value = false
  emits('onDeleting', props.keyElement)
}

function declineDelete(){
  isShowConfirmDelete.value = false
  emits('onWaitingAction', -1)
}

watch(props.special, (val) => {
  type.value = val.type
  name.value = val.name
  time.value = val.time
  global.value = val.global
  value.value = val.value
}, {immediate: true})
</script>