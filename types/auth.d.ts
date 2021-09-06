interface User {
  uid;
  displayName: string;
  email: string;
  emailVerified: string;
  photoURL: photoURL | null;
}

interface AuthStoreState {
  isLoading: boolean;
  errorMessage: string;
  user: User | undefined;
}
