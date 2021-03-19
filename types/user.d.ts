interface User {
  id: string;
  active: boolean;
  name: string;
  picture: string;
  travelAllowance: boolean;
  projects: string[];
}

interface UserStoreState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
}
