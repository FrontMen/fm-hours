interface User {
  id: string;
  active: boolean;
  name: string;
  picture: string;
  travelAllowance: boolean;
}

interface UserStoreState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
}
