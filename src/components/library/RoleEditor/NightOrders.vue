<template>
  <div class="flex items-center mb-4">
    <div class="flex-1">
      <input-title-block
          :label-class="labelClass"
          :label="label"
          :required="required"
          :info="info" />
      <div class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-10 gap-3 transition text-[color:var(--color-text)] border-[color:var(--color-border)]"
           @click="isOpen = true">
        <span v-if="value > 0">{{ value }}</span>
        <span v-else>{{ actionText }}</span>
      </div>
    </div>
    <popup-container
        v-if="isOpen"
        :is-input-visible="true"
        :input-value="orderValue"
        :is-disabled="disabled"
        @close="closeAndSave"
        @on-input-change="onInputChange">
      <template #header>
        {{ disabled ? 'View' : 'Choose' }} {{ label }}
      </template>
      <template #content>
        <draggable-component v-model="roles" item-key="id" :move="isMoved" @change="onDragChange">
          <template #item="{ element }">
            <div :ref="isCurrent(element) ? 'current' : null">
              <popup-horizontal-list-element
                  :name="element.name"
                  :ability="element.ability"
                  :value="element[orderField]"
                  :element="element"
                  :is-current="isCurrent(element)" />
            </div>
          </template>
        </draggable-component>
      </template>
    </popup-container>
  </div>
</template>
<script setup>
import {nextTick, ref, watch} from "vue";
import draggableComponent from "vuedraggable";
import { useLibraryStore } from "@/store/library";
import {storeToRefs} from "pinia";
import {DEFAULT_MIN_TIME} from "@/constants/other";
import {MAIN_ROLES} from "@/constants/roles";
import PopupHorizontalListElement from "@/components/library/RoleEditor/PopupHorizontalListElement.vue";
import PopupContainer from "@/components/PopupContainer.vue";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const props = defineProps({
  label: String,
  value: Number,
  character: Object,
  actionText: String,
  orderField: String,
  divClass: {
    type: String
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: String,
    default: "border rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm form-input pr-16"
  },
  info: {
    type: String,
    default: "",
  },
  required: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const libraryStore = useLibraryStore()
const { allListsAsOne } = storeToRefs(libraryStore)

const isOpen = ref(false)
const orderValue = ref(0)
const roles = ref([])
const current = ref(null)
const emit = defineEmits(['update:value'])

const isCurrent = (role) => role.id === props.character.id

const scrollToCurrent = () => {
  nextTick(() => {
    setTimeout(() => {
      if (isOpen.value && current.value) {
        current.value.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }, DEFAULT_MIN_TIME)
  })
}

const scrollIfOutOfView = (elRef) => {
  const el = Array.isArray(elRef?.value) ? elRef.value[0] : elRef?.value;

  if (!el || typeof el.getBoundingClientRect !== "function") {
    return;
  }

  const rect = el.getBoundingClientRect();
  const isOutOfView =
      rect.top < 0 ||
      rect.bottom > window.innerHeight ||
      rect.left < 0 ||
      rect.right > window.innerWidth;

  if (isOutOfView) {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
  }
}

function getRoleList() {
  const arr = [];

  const elems = MAIN_ROLES.map(team => allListsAsOne.value[team].filter(el => el[props.orderField] > 0)).flat()
  if(!elems.find(el => el.id === props.character.id) && props.character[props.orderField] > 0) {
      arr.push(...elems, props.character);
  } else {
    arr.push(...elems);
  }

  return sortRules(arr)
}

function watcherValue(val) {
  let el = roles.value.findIndex(el => el.id === props.character.id)
  if(el === -1){
    addToRolesList(props.character)
    el = roles.value.length - 1
  }
  roles.value[el][props.orderField] = val
  orderValue.value = val
  roles.value = sortRules(roles.value)

  nextTick(() => {
    scrollIfOutOfView(current);
  });
}

function addToRolesList(elem){
  roles.value.push({ ...elem })
}

function removeFromRolesList(){
  let el = roles.value.findIndex(el => el.id === props.character.id)
  if(el !== -1) roles.value.splice(el, 1)
}

function sortRules(arr) {
  const teamPriority = {
    demon: 1,
    minion: 2,
    outsider: 3,
    townsfolk: 4
  };

  arr.sort((a, b) => {
    const orderA = a[props.orderField];
    const orderB = b[props.orderField];

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const teamA = teamPriority[a.team] || 99;
    const teamB = teamPriority[b.team] || 99;

    if (teamA !== teamB) {
      return teamA - teamB;
    }

    return a.name.localeCompare(b.name);
  });

  return arr
}

function closeAndSave(){
  if(orderValue.value > 0){
    emit('update:value', orderValue.value)
  }
  isOpen.value = false
}

function onInputChange(event){
  if(event.target.value > 0){
    watcherValue(Number(event.target.value))
  } else {
    orderValue.value = 0
    removeFromRolesList()
  }
}

function isMoved(evt) {
  return !props.disabled && isCurrent(evt.draggedContext.element)
}

function onDragChange(event){
  const newIndex = event.moved.newIndex
  watcherValue(newIndex - 1 < 0 ? 1 : roles.value[newIndex - 1][props.orderField])
}

watch(isOpen, (newVal) => {
  if(newVal) scrollToCurrent()
})

watch(() => props.value, (newVal) => {
  orderValue.value = !!newVal ? newVal : 0
  roles.value = getRoleList()
}, {immediate: true})
</script>