import RecordsService from "~/services/records-service";
import UsersService from "~/services/users-service";
import WorkSchemeService from "~/services/work-scheme-service";

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $recordsService: RecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }

  interface Context {
    $recordsService: RecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }
}
