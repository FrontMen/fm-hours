import CustomersService from "~/services/customers-service";
import HolidaysService from "~/services/holidays-service";
import RecordsService from "~/services/records-service";
import UsersService from "~/services/users-service";
import WorkSchemeService from "~/services/work-scheme-service";

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $customersService: CustomersService;
    $holidaysService: HolidaysService;
    $recordsService: RecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }

  interface Context {
    $customersService: CustomersService;
    $holidaysService: HolidaysService;
    $recordsService: RecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }
}
