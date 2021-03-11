import RecordsService from '~/services/records-service'

declare module 'vue/types/vue' {
  interface Vue extends Vue {
    $recordsService: RecordsService
  }
}
