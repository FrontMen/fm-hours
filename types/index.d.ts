import HolidaysService from "~/services/holidays-service";
import RecordsService from "~/services/records-service";
import UsersService from "~/services/users-service";
import WorkSchemeService from "~/services/work-scheme-service";

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $holidaysService: HolidaysService;
    $recordsService: RecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }

  interface Context {
    $holidaysService: HolidaysService;
    $recordsService: RecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }
}
