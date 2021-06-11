export default (): EmployeeStoreState => ({
  isLoggedIn: false,
  isAdmin: false,
  isLoading: false,
  employee: null,
  errorMessage: "",
});
