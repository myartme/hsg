<template>
  <div v-if="!isEmpty(errorList)" class="mb-2">
    <h3 class="font-semibold mb-1 text-[color:var(--color-button-error)]">Problems:</h3>
    <div class="border rounded-md p-3 text-[color:var(--color-button-hover-error)] bg-[color:var(--color-bg-error)] border-[color:var(--color-border-error)]">
      <p v-for="(error, key) in errorList" :key="key" v-html="error" class="text-sm leading-snug">
      </p>
    </div>
  </div>
  <div v-if="!isEmpty(charsList)" class="mb-2">
    <h3 class="font-semibold mb-1 text-[color:var(--color-title-text)]">Ready to import:</h3>
    <div class="border-2 rounded-md max-w-xs text-theme border-[color:var(--color-border)]">
      <table class="w-full text-sm border-collapse">
        <thead class="text-[color:var(--color-title-text)] bg-[color:var(--color-bg)]">
        <tr>
          <th class="text-left px-3 py-1">Team</th>
          <th class="text-right px-3 py-1">Count</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(count, name) in charsList" :key="count" class="border-t">
          <td class="capitalize px-3 py-1">{{ name }}</td>
          <td class="font-mono text-right px-3 py-1">{{ count.length }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import {isEmpty} from "lodash/lang";

const props = defineProps({
  errorList: Array,
  charsList: Object
})
</script>