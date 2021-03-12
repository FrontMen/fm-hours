import { defineNuxtPlugin } from '@nuxtjs/composition-api'

import RecordsService from '~/services/records-service'
import UsersService from '~/services/users-service'
import WorkSchemeService from '~/services/work-scheme-service'

export default defineNuxtPlugin(({ $fire }, inject) => {
  inject('recordsService', new RecordsService($fire))
  inject('usersService', new UsersService($fire))
  inject('workSchemeService', new WorkSchemeService())
})
