import {defineNuxtPlugin} from '@nuxtjs/composition-api';

import CustomersService from '~/services/customers-service';
import TimeRecordsService from '~/services/time-records-service';
import TravelRecordsService from '~/services/travel-records-service';
import EmployeesService from '~/services/employees-service';
import TeamsService from '~/services/teams-service';
import WorkSchemeService from '~/services/work-scheme-service';
import TimesheetsService from '~/services/timesheets-service';
import ContractsService from '~/services/contracts-service';
import BridgeService from '~/services/bridge-service';
import TimesheetsRepository from '~/api/timesheets/timesheets-repository';
import WorkSchemeRepository from '~/api/work-scheme/work-scheme-repository';
import TimeRecordsRepository from '~/api/records/time-records-repository';

export default defineNuxtPlugin(({$fire, $fireModule, $axios}, inject) => {
  const travelRecordsService = new TravelRecordsService($fire);
  const timesheetsRepository = new TimesheetsRepository($fire);
  const workSchemeRepository = new WorkSchemeRepository($axios);
  const timeRecordsRepository = new TimeRecordsRepository($fire, $axios);

  inject('contractsService', new ContractsService($axios));
  inject('customersService', new CustomersService($fire, $fireModule));
  inject('timeRecordsService', new TimeRecordsService(timeRecordsRepository));
  inject('travelRecordsService', travelRecordsService);
  inject('employeesService', new EmployeesService($fire, $fireModule));
  inject('teamsService', new TeamsService($fire, $fireModule));
  inject('workSchemeService', new WorkSchemeService(workSchemeRepository));
  inject('timesheetsService', new TimesheetsService(timesheetsRepository));
  inject('bridgeService', new BridgeService($axios));
});
