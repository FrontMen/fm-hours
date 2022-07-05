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
  inject('customersService', new CustomersService($fire));
  inject('timeRecordsService', new TimeRecordsService($fire, $axios));
  inject('travelRecordsService', new TravelRecordsService($fire));
  inject('employeesService', new EmployeesService($fire));
  inject('workSchemeService', new WorkSchemeService($axios));
  inject('timesheetsService', new TimesheetsService($fire));
  inject('bridgeService', new BridgeService($axios));
});
