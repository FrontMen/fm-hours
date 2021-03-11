import { defineNuxtPlugin } from '@nuxtjs/composition-api'

import RecordsService from '~/services/records-service'

export default defineNuxtPlugin(({ $fire }, inject) => {
  inject('recordsService', new RecordsService($fire))
})
