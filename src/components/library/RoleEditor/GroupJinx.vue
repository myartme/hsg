<template>
  <div :class="divClass">
    <div ref="top"></div>
    <input-title-block
        :label-class="labelClass"
        :label="label"
        :required="required"
        :info="info" />
    <div v-if="!disabled">
      <div class="flex items-center mb-4">
        <div class="flex-1">
          <div class="flex items-center space-x-1 mb-1">
            <label class="block mb-1 title-theme">ID</label>
            <info-tooltip text="The ID of the other character this one is jinxed with." icon-size="w-5 h-5" />
          </div>
          <div class="flex items-center">
            <div @click="isOpenPopup = true"
                class="flex flex-1 items-center cursor-pointer border-2 border-dashed rounded-md px-3 py-2 h-15 gap-3 transition border-[color:var(--color-border)] text-[color:var(--color-text)]">
              <template v-if="selectedRole">
                <image-any-script :character="selectedRole" img-class="w-10 h-10 rounded" />
                <span>{{ selectedRole.name }}</span>
                <span class="text-xs">{{ selectedRole.ability }}</span>
              </template>
              <span v-else class="text-[color:var(--color-placeholder-text)]">Click to select character</span>
            </div>
            <button
                @click="addRole"
                :class="[
                    'ml-4 px-4 py-2 rounded-xl whitespace-nowrap text-[color:var(--color-text)] border-[color:var(--color-border)]',
                    !selectedRole || !input
                    ? 'cursor-not-allowed bg-[color:var(--color-disable-bg)]'
                    : 'cursor-pointer text-[color:var(--color-text)] bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]'

                ]"
                :disabled="!selectedRole || !input"
            >
              {{ isEditMode ? 'Save' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-1 mb-1">
        <label class="block mb-1 title-theme">Reason</label>
        <info-tooltip text="The Jinx explanation." icon-size="w-5 h-5" />
      </div>
      <div class="relative">
        <textarea
            class="input-theme rounded-md px-3 py-1 w-full focus:outline-none pr-16 resize-none"
            v-model="input"
            :maxlength="maxlength"
            rows="4"
        ></textarea>
        <div class="multiline-reached-info-theme text-[color:var(--color-placeholder-text)]">
          {{ input?.length }} / {{ maxlength }}
        </div>
      </div>
    </div>
    <div v-if="currentJinxes.length">
      <label :class="[
          labelClass,
          'title-theme'
      ]">Jinxed Characters</label>
      <ul>
        <li
            v-for="(item, idx) in currentJinxes"
            :key="idx"
            :ref="el => roleRefs[idx] = el"
            class="mb-3"
        >
          <div class="border rounded-md flex flex-1 p-3 items-center gap-3 transition border-[color:var(--color-border)]">
            <img :src="item.image" class="w-10 h-10 rounded" alt="image" />
            <div class="text-[color:var(--color-text)]">{{ item.name }}</div>
            <div class="text-xs text-[color:var(--color-text)]">{{ item.reason }}</div>
            <div v-if="!disabled" class="flex gap-2 ml-auto">
              <button
                  class="text-sm rounded-xl p-2 pl-3 pr-3 cursor-pointer text-[color:var(--color-text)] border-[color:var(--color-border)] bg-[color:var(--color-active)] hover:bg-[color:var(--color-hover-active)]"
                  @click="editRole(idx)"
              >Edit</button>
              <button
                  class="text-sm rounded-xl p-2 cursor-pointer text-[color:var(--color-text)] border-[color:var(--color-border)] bg-[color:var(--color-button-error)] hover:bg-[color:var(--color-button-hover-error)]"
                  @click="removeRole(idx)"
              >Delete</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <jinx-role-list-popup
        v-model:is-open="isOpenPopup"
        :jinxes="currentJinxes"
        @role-is-selected="selectedRole = $event" />
    <div ref="bottom"></div>
  </div>
</template>
<script setup>
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import {nextTick, ref, watch} from "vue";
import ImageAnyScript from "@/components/ui/ImageAnyScript.vue";
import JinxRoleListPopup from "@/components/library/RoleEditor/JinxRoleListPopup.vue";
import {getImageFirstUrl} from "@/constants/other";
import InputTitleBlock from "@/components/ui/InputTitleBlock.vue";

const props = defineProps({
  label: String,
  value: Array,
  maxlength: {
    type: Number,
    default: 50
  },
  divClass: {
    type: String
  },
  labelClass: {
    type: String,
    default: "text-lg block font-semibold mb-1"
  },
  inputClass: {
    type: String,
    default: "border border-gray-300 rounded-md px-3 py-2 h-10 w-full focus:outline-none shadow-sm focus:ring-violet-500 form-input pr-16"
  },
  textareaClass: {
    type: String,
    default: "border border-gray-300 rounded-md px-3 py-1 w-full focus:outline-none shadow-sm pr-16 resize-none"
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
const input = ref("")
const isOpenPopup = ref(false)
const isEditMode = ref(false)
const selectedRole = ref(null)
const currentJinxes = ref([])
const roleRefs = ref([])
const top = ref(null)
const bottom = ref(null)
const emits = defineEmits(['update:value'])

const formatRole = (role) => {
  if(!role){
    return { id: "", reason: "", image: "", name: "", ability: "" }
  }

  return {
    id: role.id,
    reason: role.reason,
    image: getImageFirstUrl(role),
    name: role.name,
    ability: role.ability
  }
}

const addRole = () => {
  if (!selectedRole.value || !input.value) return

  const edx = currentJinxes.value.findIndex(el => (el.id === selectedRole.value.id))

  if(edx !== -1){
    currentJinxes.value[edx].reason = input.value
  } else {
    currentJinxes.value.push(
        formatRole({...selectedRole.value, ...{ reason: input.value } })
    )
  }
  emits('update:value', currentJinxes.value)
  selectedRole.value = null
  input.value = ''
  if(isEditMode){
    isEditMode.value = false
  }
  if(edx !== -1){
    scrollToRole(edx)
  } else {
    scrollToBottom()
  }
}

const editRole = (index) => {
  isEditMode.value = true
  const item = currentJinxes.value[index]
  selectedRole.value = item
  input.value = item.reason
  scrollToTop()
}

const removeRole = (index) => {
  currentJinxes.value.splice(index, 1)
  emits('update:value', currentJinxes.value)
}

const scrollToTop = () => {
  nextTick(() => {
    top.value.scrollIntoView({ behavior: "smooth", block: "start" })
  })
}

const scrollToRole = (idx) => {
  nextTick(() => {
    const el = roleRefs.value[idx]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    bottom.value.scrollIntoView({ behavior: "smooth", block: "end" })
  })
}

watch(() => props.value, () => {
  currentJinxes.value = !!props.value ? [...props.value] : []
},{ immediate: true, deep: true })
</script>