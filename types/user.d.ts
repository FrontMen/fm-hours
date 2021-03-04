declare enum RecordStatus {
  NEW = "new",
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
}

interface User {
  id: string;
  name: string;
  picture: string;
  travelAllowence: boolean;
}

interface TimeRecord {
  date: string;
  hours: number;
  customer: string;
  debtor: string;
  status: string; // TODO: add status enum?
}

interface TravelAllowanceRecord {
  date: string;
  hours: number;
}

interface UserStoreState {
  isLoggedin: boolean;
  isAdmin: boolean;
  user: User | null;
  lastSaved: Date | null;
  // FIXME: rename to camelCase
  // eslint-disable-next-line camelcase
  time_records: TimeRecord[];
  // FIXME: rename to camelCase
  // eslint-disable-next-line camelcase
  travelAllowance_records: TravelAllowanceRecord[];
}
