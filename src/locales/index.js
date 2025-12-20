import { createI18n } from 'vue-i18n'
import en from './en.json'
import ru from './ru.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  warnHtmlMessage: false,
  messages: {
    en,
    ru
  }
})

export default i18n
