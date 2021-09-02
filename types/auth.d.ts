interface User {
  uid;
  displayName: string;
  email: string;
  emailVerified: string;
  photoURL: photoURL | null;
}

interface AuthStoreState {
  isLoggedIn: boolean;
  isLoading: boolean;
  errorMessage: string;
  user: User | undefined;
}
