<template>
  <div class="flex items-center space-x-4 -m-1.7 p-0.3">
    <div class="w-10 h-10 ml-5">
      <img
          :src="characterImage"
          class="w-full h-full scale-135"
          :alt="character.name"
      >
    </div>

    <div class="w-[12%] -ml-2 mr-2 relative flex flex-col items-start h-auto flex-shrink-0 py-1">
      <h3 class="text-xs font-medium leading-tight block">
        {{ character.name }}
      </h3>
      <div
          v-if="jinxes"
          class="mt-1 -ml-[5px] flex flex-nowrap"
      >
        <img
            v-for="jinx in jinxes"
            :key="jinx.id"
            :src="jinx.image"
            class="w-6 h-6 inline-block align-top -mt-2.5 -ml-[5px] first:ml-0"
            :alt="jinx.name"
        />
      </div>
    </div>

    <div class="flex-1 min-w-0 mr-5">
      <p class="text-xs leading-tight whitespace-pre-line mr-4" style="color: rgb(55, 60, 60);">
        {{ character.ability }}
      </p>
    </div>
  </div>
</template>
<script setup>
import {getImageFirstUrl} from "@/constants/other";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {ref, watch} from "vue";
import {getBase64Image} from "@/store";

const props = defineProps({
  character: Object
})

const { pdfListWithParams } = storeToRefs(useCraftStore())
const characterImage = ref('')
const jinxes = ref([])

async function getValidJinxesForCharacter(character) {
  if (!character?.jinxes || !Array.isArray(character.jinxes)) return []

  const allRoles = Object.values(pdfListWithParams.value)
      .flat()
      .filter(role => role?.id)

  const roleMap = Object.fromEntries(allRoles.map(role => [role.id, role]))

  const jinxes = await Promise.all(character.jinxes.map(async (jinx) => {
    const matched = roleMap[jinx.id]
    if (!matched) return null

    const image = await getBase64Image(matched.image)

    return {
      id: jinx.id,
      reason: jinx.reason,
      image: image || "",
      name: matched.name || "",
      ability: matched.ability || ""
    }
  }))

  return jinxes.filter(Boolean)
}

watch(() => props.character, async () => {
  if (!props.character) return

  jinxes.value = await getValidJinxesForCharacter(props.character)
  const url = getImageFirstUrl(props.character, props.character.isOfficial)
  characterImage.value = props.character.isOfficial ? url : await getBase64Image(url)
}, {immediate:true})
</script>