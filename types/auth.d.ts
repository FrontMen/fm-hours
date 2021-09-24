interface User {
  uid;
  displayName: string;
  email: string;
  emailVerified: string;
  photoURL: string | null;
  samlToken: string;
  bridgeUid: number | null;
}

interface AuthStoreState {
  isLoading: boolean;
  errorMessage: string;
  user: User | undefined;
}
