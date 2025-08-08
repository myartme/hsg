<template>
  <div>
    <div v-if="teamItems.length > 0" class="flex items-center mb-1 mt-1">
      <div class="flex-grow-0 border-t w-[10%] border-[color:var(--color-border)]"></div>
      <span class="text-xxs px-1 border rounded-full title-theme border-[color:var(--color-border)]">
        {{ teamItems.length }}
      </span>
      <div class="flex-grow border-t border-[color:var(--color-border)]"></div>
      <span class="text-xxs px-3 border rounded-full title-theme border-[color:var(--color-border)]">
        {{ teamName }}{{ teamName !== 'townsfolk' ? 's' : '' }}
      </span>
      <div class="flex-grow-0 border-t w-[5%] border-[color:var(--color-border)]"></div>
    </div>
    <div
        v-for="(character, key) in teamItems"
        :key="character.id"
        class="flex items-center space-x-4 -m-1.7 select-none border-[color:var(--color-border)] hover:bg-[color:var(--color-hover-bg)]"
        @click="selectRole(character, key)"
    >
      <div class="w-10 h-10 flex-shrink-0 relative ml-2">
        <img class="absolute inset-0 w-full h-full object-cover scale-125"
             :src="getImageFirstUrl(character, character.isOfficial)"
             :alt="character.name" />
      </div>
      <div class="w-[15%] flex flex-col justify-center h-10 flex-shrink-0 relative">
        <h3 class="text-xs font-medium truncate z-10 title-theme">
          {{ character.name }}
        </h3>
        <div
            v-if="character?.jinxes"
            class="absolute -left-1 top-full -mt-2 flex flex-nowrap overflow-visible z-0 cursor-pointer"
            style="transform: translateY(-50%);"
        >
          <template v-for="jinx in getValidJinxesForCharacter(character)">
            <tooltip
                :triggers="['hover', 'focus']"
                placement="top"
                :delay="{ show: tooltipDelay.jinxesShow, hide: tooltipDelay.jinxesHide }"
            >
              <template #default>
                <img :key="jinx.id"
                    :src="jinx.image"
                    class="w-6 h-6 inline-block align-top -ml-[5px] first:ml-0"
                    :alt="jinx.name"
                />
              </template>
              <template #popper>
                <div v-html="jinx.reason"></div>
              </template>
            </tooltip>
          </template>
        </div>
      </div>
      <div class="flex-1 min-w-0 mr-4">
        <p class="text-xxs leading-tight whitespace-pre-line text-theme">
          {{ character.ability }}
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import {getImageFirstUrl} from "@/constants/other";
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {Tooltip} from "floating-vue";
import {useOptionsStore} from "@/store/options";
import {isDeletingFromPdfCharacterList} from "@/store/craft/state";

const props = defineProps({
  teamName: String,
  teamItems: Object
});

const craftStore = useCraftStore()
const { pdfListWithParams } = storeToRefs(craftStore)
const optionsStore = useOptionsStore()
const { tooltipDelay } = storeToRefs(optionsStore)

function selectRole(character, key) {
  craftStore.addElementToFirstList(character, props.teamName, key)
  isDeletingFromPdfCharacterList.value = true
}

function getValidJinxesForCharacter(character) {
  if (!character?.jinxes || !Array.isArray(character.jinxes)) return []

  const allRoles = Object.values(pdfListWithParams.value)
      .flat()
      .filter(role => role?.id)

  const roleMap = Object.fromEntries(allRoles.map(role => [role.id, role]))

  return character.jinxes
      .map(jinx => {
        const matched = roleMap[jinx.id]
        if (!matched) return null

        return {
          id: jinx.id,
          reason: jinx.reason,
          image: getImageFirstUrl(matched),
          name: matched.name || "",
          ability: matched.ability || ""
        }
      })
      .filter(Boolean)
}
</script>