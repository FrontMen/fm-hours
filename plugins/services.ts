import { defineNuxtPlugin } from '@nuxtjs/composition-api'

import RecordsService from '~/services/records-service'
import WorkSchemeService from '~/services/work-scheme-service'

export default defineNuxtPlugin(({ $fire }, inject) => {
  inject('recordsService', new RecordsService($fire))
  inject('workSchemeService', new WorkSchemeService())
})
