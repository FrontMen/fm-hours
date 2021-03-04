interface RootStoreState {
  customers: CustomersStoreState;
  holidays: HolidaysStoreState;
  user: UserStoreState;
  // FIXME: rename to camelCase?
  "week-dates": WeekDatesStoreState;
}
