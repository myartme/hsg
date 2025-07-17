<template>
  <div class="flex-1 flex justify-center items-start">
    <img v-if="bannerLeftPosition"
         class="w-[65px] h-[1050px] pt-10"
         :src="bannerSrc"
         :alt="bannerAlt" />
    <div class="flex-1 flex justify-start ml-[15px] pt-10">
      <table class="border-separate border-spacing-y-0 ml-2">
        <tbody>
        <tr class="align-middle h-[38px]">
          <td class="w-[48px] h-[38px] p-0">
            <img class="w-8 h-8 object-contain mx-auto scale-120"
                 src="/images/elements/pdf/dusk.png"
                 alt="Dusk first night" />
          </td>
          <td class="h-[38px] p-0 pl-1">
            <h3 class="text-xs font-medium mb-3">Dusk</h3>
          </td>
        </tr>
        <tr v-for="role in night" :key="role.id" class="align-middle h-[38px]">
          <td class="w-[48px] h-[38px] p-0">
            <img
                v-if="role.id === 'pdf_minion_info'"
                class="w-8 h-8 object-contain mx-auto scale-130"
                src="/images/elements/pdf/minionInfo.png"
                alt="Minion info first night"
            />
            <img
                v-else-if="role.id === 'pdf_demon_info'"
                class="w-8 h-8 object-contain mx-auto scale-130"
                src="/images/elements/pdf/demonInfo.png"
                alt="Demon info first night"
            />
            <img
                v-else
                class="w-11 h-11 object-contain mx-auto scale-130"
                :src="role.base64Image"
                :alt="role.name"
            />
          </td>
          <td class="h-[38px] p-0 pl-1">
            <h3 class="text-xs font-medium mb-3">
              {{ role.id === 'pdf_minion_info' ? 'Minion info' : role.id === 'pdf_demon_info' ? 'Demon info' : role.name }}
            </h3>
          </td>
        </tr>
        <tr class="align-middle h-[38px]">
          <td class="w-[48px] h-[38px] p-0">
            <img class="w-8 h-8 object-contain mx-auto scale-120"
                 src="/images/elements/pdf/dawn.png"
                 alt="Dawn first night" />
          </td>
          <td class="h-[38px] p-0 pl-1">
            <h3 class="text-xs font-medium mb-3">Dawn</h3>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <img v-if="!bannerLeftPosition"
         class="w-[65px] h-[1050px] pt-10"
         :src="bannerSrc"
         :alt="bannerAlt" />
  </div>
</template>
<script setup>

const props = defineProps({
  night: Array,
  bannerAlt: String,
  bannerSrc: String,
  bannerLeftPosition: Boolean
})

</script>