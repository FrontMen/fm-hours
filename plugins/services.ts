import { defineNuxtPlugin } from "@nuxtjs/composition-api";

import CustomersService from "~/services/customers-service";
import HolidaysService from "~/services/holidays-service";
import TimeRecordsService from "~/services/time-records-service";
import TravelRecordsService from "~/services/travel-records-service";
import UsersService from "~/services/users-service";
import WorkSchemeService from "~/services/work-scheme-service";

export default defineNuxtPlugin(({ $fire }, inject) => {
  inject("customersService", new CustomersService($fire));
  inject("holidaysService", new HolidaysService($fire));
  inject("timeRecordsService", new TimeRecordsService($fire));
  inject("travelRecordsService", new TravelRecordsService($fire));
  inject("usersService", new UsersService($fire));
  inject("workSchemeService", new WorkSchemeService());
});
