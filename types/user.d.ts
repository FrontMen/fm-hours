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
}
