import CustomersService from '~/services/customers-service';
import HolidaysService from '~/services/holidays-service';
import TimeRecordsService from '~/services/time-records-service';
import TravelRecordsService from '~/services/travel-records-service';
import EmployeesService from '~/services/employees-service';
import WorkSchemeService from '~/services/work-scheme-service';
import TimesheetsService from '~/services/timesheets-service';
import MailService from '~/services/mail-service';
import AuthService from '~/services/auth-service';

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $customersService: CustomersService;
    $holidaysService: HolidaysService;
    $timeRecordsService: TimeRecordsService;
    $travelRecordsService: TravelRecordsService;
    $employeesService: EmployeesService;
    $workSchemeService: WorkSchemeService;
    $timesheetsService: TimesheetsService;
    $mailService: MailService;
    $authService: AuthService;
  }

  interface Context {
    $customersService: CustomersService;
    $holidaysService: HolidaysService;
    $timeRecordsService: TimeRecordsService;
    $travelRecordsService: TravelRecordsService;
    $employeesService: EmployeesService;
    $workSchemeService: WorkSchemeService;
    $timesheetsService: TimesheetsService;
    $authService: AuthService;
  }
}
