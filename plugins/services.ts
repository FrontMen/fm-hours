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

export default defineNuxtPlugin(({$fire, $fireModule, $axios}, inject) => {
  const bridgeService = new BridgeService($axios);
  const contractsService = new ContractsService($axios);
  const customersService = new CustomersService($fire, $fireModule);
  const employeesService = new EmployeesService($fire, $fireModule);
  const teamsService = new TeamsService($fire, $fireModule);
  const timesheetsService = new TimesheetsService($fire);
  const travelRecordsService = new TravelRecordsService($fire);
  const workSchemeService = new WorkSchemeService($axios);
  const timeRecordsService = new TimeRecordsService(
    $fire,
    $axios,
    timesheetsService,
    travelRecordsService
  );

  inject('bridgeService', bridgeService);
  inject('contractsService', contractsService);
  inject('customersService', customersService);
  inject('employeesService', employeesService);
  inject('teamsService', teamsService);
  inject('timeRecordsService', timeRecordsService);
  inject('timesheetsService', timesheetsService);
  inject('travelRecordsService', travelRecordsService);
  inject('workSchemeService', workSchemeService);
});
