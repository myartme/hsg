<template>
  <div class="flex flex-col h-[1100px] relative pt-7">
    <div class="flex-1">
      <h2 class="ml-2.5 mr-2.5 pb-2 text-lg font-serif tracking-widest text-center uppercase whitespace-nowrap overflow-hidden" style="color: rgb(100,25,32);">{{ trimmedName }}</h2>
      <img src="/images/elements/pdf/line_break.png" alt="Line Break" class="w-full -mb-3 scale-95" />
      <table class="w-full border-separate ml-2">
        <tbody>
        <template v-if="jinxes">
          <tr>
            <td colspan="3" class="text-lg font-serif tracking-widest text-center" style="color: rgb(100,25,32)">JINXES</td>
          </tr>
          <tr v-for="(jinx, index) in jinxes" class="align-middle" :key="jinx.id">
            <template v-if="index < 7">
              <td class="w-[48px] h-[38px] p-0">
                <img
                    :src="jinx.first.base64Image"
                    class="w-11 h-11 object-contain mx-auto scale-130"
                    :alt="'first'+index" />
              </td>
              <td class="w-[48px] h-[38px] p-0">
                <img
                    :src="jinx.second.base64Image"
                    class="w-11 h-11 object-contain mx-auto scale-130"
                    :alt="'second'+index" />
              </td>
              <td>
                <p class="text-xxs leading-tight ml-2 mr-6 mb-3" style="color: rgb(100,25,32);">
                  {{ jinx.reason }}
                </p>
              </td>
            </template>
            <td v-else-if="index === 9" colspan="3">
              <p class="text-xxs leading-tight ml-2 mr-6 mb-4" style="color: rgb(100,25,32);">
                (Only first 7 shown. There were {{ jinxes.length }} in total.)
            </p>
            </td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>
    <div v-if="travellers.length > 0 || fabled.length > 0" class="absolute bottom-0 left-0 right-0">
      <h2 class="pb-2 w-full text-lg font-serif tracking-widest text-center" style="color: rgb(100,25,32)">RECOMMENDED</h2>
      <img src="/images/elements/pdf/line_break.png" alt="Line Break" class="w-full -mb-3 scale-95" />
      <table class="border-separate w-full" style="border-spacing: 4px 6px;">
        <tbody>
          <tr>
            <td colspan="2" class="text-lg font-serif text-left pl-3 w-[50%]" style="color: rgb(100,25,32)">TRAVELLERS</td>
            <td colspan="2" class="text-lg font-serif text-left pl-3 w-[50%]" style="color: rgb(100,25,32)">FABLED</td>
          </tr>
          <tr v-for="i in Math.max(travellers.length, fabled.length)" :key="i" class="align-middle">
            <template v-if="i < 5 || (i === 5 && (travellers.length <= 5 && fabled.length <= 5))">
              <recommended-row-item :item="travellers[i - 1]" />
              <recommended-row-item :item="fabled[i - 1]" />
            </template>
            <template v-else>
              <template v-if="i === 5">
                <recommended-row-item v-if="travellers.length <= 5" :item="travellers[i - 1]" />
                <td v-else colspan="2" class="align-middle" style="width: calc(50% - 48px - 6px); padding-left: 2px; padding-right: 12px;">
                  <p class="text-xxs leading-tight mb-3 ml-7" style="color: rgb(100,25,32);">
                    +{{ travellers.length - 4 }} travellers
                  </p>
                </td>
                <recommended-row-item v-if="fabled.length <= 5" :item="fabled[i - 1]" />
                <td v-else colspan="2" class="align-middle" style="width: calc(50% - 48px - 6px); padding-left: 2px; padding-right: 12px;">
                  <p class="text-xxs leading-tight mb-3 ml-7" style="color: rgb(100,25,32);">
                    +{{ fabled.length - 4 }} fabled
                  </p>
                </td>
              </template>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>

import {useCraftStore} from "@/store/craft";
import {computed} from "vue";
import RecommendedRowItem from "@/components/craft/pdf/print/RecommendedRowItem.vue";

const props = defineProps({
  jinxes: {
    type: Array,
    default: []
  },
  travellers: {
    type: Array,
    default: []
  },
  fabled: {
    type: Array,
    default: []
  },
})

const trimmedName = computed(() => {
  const maxChars = 23
  const craftStore = useCraftStore()
  const text = craftStore.pdfMeta.name
  return text.length > maxChars
      ? text.slice(0, maxChars - 1) + '…'
      : text
})

</script>