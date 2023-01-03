import {computed, onMounted, ref, useRoute, useStore} from '@nuxtjs/composition-api';

export function useEmployees() {
  const store = useStore<RootStoreState>();
  const route = useRoute();
  const employees = computed(() => store.state.employees.employees);

  const showEmployeeError = ref<Boolean>(false);

  onMounted(() => {
    store.dispatch('employees/get');
  });

  const getEmployeeById = (id: string) => {
    const employee = employees.value.find(e => e.id === id);
    if (!employee) {
      showEmployeeError.value = true;
      return;
    }

    showEmployeeError.value = false;

    if (employee?.id === store.state.employee.employee?.id) return employee;

    if (store.state.employee.employee?.isAdmin) return employee;
  };

  const employeeByRouteParamId = computed(() => getEmployeeById(route.value.params.employee_id));

  return {
    employees,
    getEmployeeById,
    showEmployeeError,
    employeeByRouteParamId,
  };
}
