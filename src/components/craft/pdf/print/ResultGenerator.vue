<template>
  <div class="max-h-screen overflow-y-auto" ref="pdfListWrapper">
  <div ref="pdfList">
    <div class="bg-white w-[800px] h-[1100px] overflow-auto relative">
      <div class="flex items-baseline ml-20 mt-1 mb-4">
        <h1 class="text-2xl font-serif font-semibold uppercase">{{ pdfMeta.name }}</h1>
        <div class="flex items-baseline ml-auto gap-2">
          <span class="mr-5" style="color: rgb(75, 85, 99);">by</span>
          <span class="text-lg font-serif first-letter:uppercase mr-25">{{ pdfMeta.author }}</span>
        </div>
      </div>
      <template v-for="(list, team) in items">
        <div v-if="MAIN_ROLES.find(el => el === team)">
          <img v-if="list.length > 0" :src="`/images/elements/pdf/team/${getPluralTeam(team)}.png`" :alt="team" class="mt-2" />
          <div class="flex items-center space-x-4 -m-1.5 ml-1 p-0.3" v-for="character in list">
            <div class="w-10 h-10 ml-5">
              <img
                  :src="character.base64Image"
                  class="w-full h-full scale-135"
                  :alt="character.name"
              >
            </div>
            <div class="w-[13%] -ml-2 mr-2 relative flex flex-col items-start h-auto flex-shrink-0 py-1">
              <h3 class="text-xs font-medium leading-tight block">
                {{ character.name }}
              </h3>
              <div v-if="character.jinxes" class="absolute -left-1 top-full -mt-0.5 flex flex-nowrap overflow-visible z-0">
                <img
                    v-for="jinx in character.jinxes"
                    :key="jinx.id"
                    :src="jinx.base64Image"
                    class="w-6 h-6 inline-block align-top -ml-[5px] first:ml-0"
                    :alt="jinx.name"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0 mr-6">
              <p class="text-xs leading-tight whitespace-pre-line mr-4" style="color: rgb(55, 60, 60);">
                {{ character.ability }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="bg-white w-[800px] h-[1100px] overflow-auto relative flex items-start">
      <night-order-table class="w-[250px]"
          :night="getNightRoles('firstNight')"
                         banner-src="/images/elements/pdf/first_night_banner.png"
                         banner-alt="First Night"
                         :bannerLeftPosition="false" />
      <night-order-middle-table
          class="w-[300px] h-[1100px]"
          :jinxes="jinxes"
          :travellers="items['traveller']"
          :fabled="items['fabled']" />
      <night-order-table class="w-[250px]"
          :night="getNightRoles('otherNight')"
                         banner-src="/images/elements/pdf/other_nights_banner.png"
                         banner-alt="Other Night"
                         :bannerLeftPosition="true" />
    </div>
  </div>
  </div>
</template>
<script setup>
import {useCraftStore} from "@/store/craft";
import {storeToRefs} from "pinia";
import {getImageFirstUrl, getPluralTeam} from "@/constants/other";
import {ref, watch} from "vue";
import {getBase64Image} from "@/store";
import NightOrderTable from "@/components/craft/pdf/print/NightOrderTable.vue";
import NightOrderMiddleTable from "@/components/craft/pdf/print/NightOrderMiddleTable.vue";
import {MAIN_ROLES} from "@/constants/roles";

const props = defineProps({
  scriptName: String,
  author: String,
  content: Object
})

const craftStore = useCraftStore()
const { pdfMeta, pdfListWithParams, pdfListElement } = storeToRefs(craftStore)
const items = ref({})
const pdfList = ref(null)
const jinxes = ref([])

watch(() => craftStore.shouldStartPrintPreparation, async (shouldStart) => {
  if (shouldStart) {
    items.value = await getListElements(pdfListWithParams.value)
    craftStore.markReadyToPrint()
  }
})

async function getListElements(pdfListCopy){
  jinxes.value = []
  const result = await Promise.all(
      Object.entries(pdfListCopy).map(async ([key, list]) => {
        const updatedList = await Promise.all(
            list.map(async (el) => {
              el.base64Image = el.isOfficial ? getImageFirstUrl(el, el.isOfficial) : await getBase64Image(getImageFirstUrl(el))
              el.jinxes = await getValidJinxesForCharacter(el, pdfListCopy)
              return el
            })
        )
        return [key, updatedList]
      })
  )
  return Object.fromEntries(result)
}

async function getValidJinxesForCharacter(character, pdfListCopy) {
  if (!character?.jinxes || !Array.isArray(character.jinxes)) return []

  const allRoles = Object.values(pdfListCopy)
      .flat()
      .filter(role => role?.id)

  const roleMap = Object.fromEntries(allRoles.map(role => [role.id, role]))

  const jinxesLocal = await Promise.all(
      character.jinxes.map(async (jinx) => {
        const matched = roleMap[jinx.id]
        if (!matched) return null
        const image = matched.isOfficial
            ? getImageFirstUrl(matched, matched.isOfficial)
            : await getBase64Image(getImageFirstUrl(matched))
        addToJinxes(character, {...matched, base64Image: image }, jinx)

        return {
          id: jinx.id,
          reason: jinx.reason,
          base64Image: image || "",
          name: matched.name || "",
          ability: matched.ability || ""
        }
      })
  )

  return jinxesLocal.filter(Boolean)
}

function addToJinxes(first, second, jinx){

  const isAlreadyAdded = jinxes.value.find(el =>
      el.first.id === second.id &&
      el.second.id === first.id)
  if(isAlreadyAdded) return

  jinxes.value.push({
    first: first,
    second: second,
    reason: jinx.reason
  })
}

function getNightRoles(field){
  const teamPriority = {
    demon: 0,
    minion: 1,
    outsider: 2,
    townsfolk: 3
  }

  const roles = Object.values(items.value)
      .flat()
      .filter(item => item[field] > 0)
      .sort((a, b) => {
        if (a[field] !== b[field]) {
          return a[field] - b[field]
        }

        return teamPriority[a.team] - teamPriority[b.team]
  })

  if(field === 'otherNight') return roles

  const result = []
  let minionInserted = false
  let demonInserted = false
  const minionObject = { id: 'pdf_minion_info' }
  const demonObject = { id: 'pdf_demon_info' }

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    if (!minionInserted && role[field] > 13.99) {
      result.push(minionObject)
      minionInserted = true
    }

    if (!demonInserted && role[field] > 18.01) {
      result.push(demonObject)
      demonInserted = true
    }

    result.push(role)
  }

  if (!minionInserted) {
    result.push(minionObject)
  }

  if (!demonInserted) {
    result.push(demonObject)
  }

  return result
}

watch(pdfList, () => {
  pdfListElement.value = pdfList.value
}, {immediate:true})
</script>