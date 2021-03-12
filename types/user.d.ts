interface User {
  id: string;
  name: string;
  picture: string;
  travelAllowance: boolean;
}

interface UserStoreState {
  isLoggedin: boolean;
  isAdmin: boolean;
  user: User | null;
}
