import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { language } from '@/store/options/state'

export function useLocaleSync() {
  const { locale } = useI18n()

  watch(language, (newLang) => {
    locale.value = newLang
  }, { immediate: true })

  return { locale }
}
