import RecordsService from '~/services/records-service'
import UsersService from '~/services/users-service';
import WorkSchemeService from '~/services/work-scheme-service';

declare module 'vue/types/vue' {
  interface Vue extends Vue {
    $recordsService: RecordsService
    $usersService: UsersService
    $workSchemeService: WorkSchemeService
  }
}
