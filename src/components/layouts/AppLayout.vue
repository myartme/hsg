<template>
  <div class="background-violet">
    <app-menu :class="theme === themes?.dark ? 'theme-dark' : 'theme-light'" />
    <router-view :class="theme === themes?.dark ? 'theme-dark' : 'theme-light'" />
  </div>

</template>
<script setup>
import AppMenu from "@/components/layouts/AppMenu.vue";
import {useOptionsStore} from "@/store/options";
import {storeToRefs} from "pinia";
import {useDebugMode} from "@/scripts/useDebugMode";
import {useLocaleSync} from "@/scripts/useLocale";

const optionsStore = useOptionsStore()
const { theme, themes } = storeToRefs(optionsStore)
optionsStore.getOptions()

useDebugMode()
useLocaleSync()
</script>