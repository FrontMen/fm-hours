interface User {
  id: string;
  name: string;
  picture: string;
  travelAllowence: boolean;
}

interface UserStoreState {
  isLoggedin: boolean;
  isAdmin: boolean;
  user: User | null;
  lastSaved: Date | null;
  // FIXME: rename to camelCase
  // eslint-disable-next-line camelcase
  time_records: any[];
  // FIXME: rename to camelCase
  // eslint-disable-next-line camelcase
  travelAllowance_records: any[];
}
