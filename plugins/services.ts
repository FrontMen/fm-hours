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
import RepositoryManager from '~/repositories';

export default defineNuxtPlugin(({$fire, $fireModule, $axios}, inject) => {
  inject('bridgeService', new BridgeService($axios));
  inject('contractsService', new ContractsService($axios));
  inject('customersService', new CustomersService($fire, $fireModule));
  inject('employeesService', new EmployeesService($fire, $fireModule));
  inject('teamsService', new TeamsService($fire, $fireModule));
  inject('timeRecordsService', new TimeRecordsService($fire, $axios));
  inject('timesheetsService', new TimesheetsService($fire));
  inject('travelRecordsService', new TravelRecordsService($fire));
  inject('workSchemeService', new WorkSchemeService($axios));
  const repositories = new RepositoryManager($fire, $fireModule);

  inject('bridgeService', new BridgeService($axios));
  inject('contractsService', new ContractsService($axios));
  inject('workSchemeService', new WorkSchemeService($axios));

  inject('customersService', new CustomersService($fire, $fireModule));
  inject('employeesService', new EmployeesService($fire, $fireModule));
  inject('teamsService', new TeamsService(repositories));
  inject('timeRecordsService', new TimeRecordsService($fire, $axios));
  inject('timesheetsService', new TimesheetsService($fire));
  inject('travelRecordsService', new TravelRecordsService(repositories));
});
