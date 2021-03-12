import { defineNuxtPlugin } from "@nuxtjs/composition-api";

import HolidaysService from "~/services/holidays-service";
import RecordsService from "~/services/records-service";
import UsersService from "~/services/users-service";
import WorkSchemeService from "~/services/work-scheme-service";

export default defineNuxtPlugin(({ $fire }, inject) => {
  inject("holidaysService", new HolidaysService($fire));
  inject("recordsService", new RecordsService($fire));
  inject("usersService", new UsersService($fire));
  inject("workSchemeService", new WorkSchemeService());
});
