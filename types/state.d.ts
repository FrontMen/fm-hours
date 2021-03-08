interface RootStoreState {
  customers: CustomersStoreState;
  holidays: HolidaysStoreState;
  records: RecordsStoreState;
  user: UserStoreState;
  // FIXME: rename to camelCase?
  "week-dates": WeekDatesStoreState;
}
