interface User {
  uid;
  displayName: string;
  email: string;
  emailVerified: string;
  samlToken: string;
}

interface AuthStoreState {
  isLoading: boolean;
  errorMessage: string;
  user: User | undefined;
}
