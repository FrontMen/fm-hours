import {computed, onMounted, ref, useStore} from '@nuxtjs/composition-api';
import {checkEmployeeAvailability} from '~/helpers/employee';

export function useEmployees() {
  const store = useStore<RootStoreState>();
  const employees = computed(() => store.state.employees.employees);

  const inactive = ref<boolean>(false);
  const billable = ref<boolean>(false);

  onMounted(() => {
    store.dispatch('employees/get');
  });

  const employeeTableItems = computed(() =>
    employees.value
      .map(employee => ({
        ...employee,
        active: checkEmployeeAvailability(employee, new Date()),
      }))
      .filter(
        employee =>
          (inactive.value ? true : employee.active) && (billable.value ? true : employee.billable)
      )
  );

  const getEmployeeById = (id: string) => {
    const employee = employees.value.find(e => e.id === id);
    if (!employee) return;

    if (employee?.id === store.state.employee.employee?.id) return employee;

    if (store.state.employee.employee?.isAdmin) return employee;
  };

  return {
    employees,
    employeeTableItems,
    getEmployeeById,
  };
}
