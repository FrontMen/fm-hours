export default (): AuthStoreState => ({
  isLoggedIn: false,
  isLoading: false,
  user: undefined,
  errorMessage: '',
});

//    isAdmin: false,
