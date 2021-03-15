interface User {
  id: string;
  name: string;
  picture: string;
  travelAllowance: boolean;
}

interface UserStoreState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
}
