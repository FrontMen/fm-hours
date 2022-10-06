import {defineNuxtPlugin} from '@nuxtjs/composition-api';

import CustomersService from '~/services/customers-service';
import TimeRecordsService from '~/services/time-records-service';
import TravelRecordsService from '~/services/travel-records-service';
import EmployeesService from '~/services/employees-service';
import WorkSchemeService from '~/services/work-scheme-service';
import TimesheetsService from '~/services/timesheets-service';
import ContractsService from '~/services/contracts-service';
import BridgeService from '~/services/bridge-service';

export default defineNuxtPlugin(({$fire, $axios}, inject) => {
  inject('contractsService', new ContractsService($axios));
  inject('customersService', new CustomersService($axios));
  inject('timeRecordsService', new TimeRecordsService($fire, $axios));
  inject('travelRecordsService', new TravelRecordsService($axios));
  inject('employeesService', new EmployeesService($axios));
  inject('workSchemeService', new WorkSchemeService($axios));
  inject('timesheetsService', new TimesheetsService($axios));
  inject('bridgeService', new BridgeService($axios));
});
