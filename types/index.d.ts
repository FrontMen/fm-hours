import CustomersService from "~/services/customers-service";
import HolidaysService from "~/services/holidays-service";
import TimeRecordsService from "~/services/time-records-service";
import TravelRecordsService from "~/services/travel-records-service";
import UsersService from "~/services/users-service";
import WorkSchemeService from "~/services/work-scheme-service";

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $customersService: CustomersService;
    $holidaysService: HolidaysService;
    $timeRecordsService: TimeRecordsService;
    $travelRecordsService: TravelRecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }

  interface Context {
    $customersService: CustomersService;
    $holidaysService: HolidaysService;
    $timeRecordsService: TimeRecordsService;
    $travelRecordsService: TravelRecordsService;
    $usersService: UsersService;
    $workSchemeService: WorkSchemeService;
  }
}
