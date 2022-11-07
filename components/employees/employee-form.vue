<i18n lang="yaml">
en:
  notFoundEmployee: "Employee not found"
  manageProjects: "Manage Projects"
  customerSearchPlaceholder: "Click or search for a customer here"
  employeeSettings: "Employee Settings"
  email: "Email"
  admin: "Admin"
  standBy: "Standby"
  endDate: "End date"
  startDate: "Start date"
  noDate: "No date selected"
  save: "Save"
nl:
  notFoundEmployee: "Medewerker niet gevonden"
  manageProjects: "Projecten bewerkern"
  customerSearchPlaceholder: "Klik of zoek naar een klant"
  employeeSettings: "Medewerker instellingen"
  email: "Email"
  admin: "Administrator"
  standBy: "Stand-by"
  endDate: "Eind datum"
  startDate: "Start datum"
  noDate: "Geen datum geselcteerd"
  save: "Opslaan"
</i18n>

<template>
  <main class="page-wrapper">
    <section class="content-wrapper my-5">
      <template v-if="mode !== 'add' && !employee">
        <p>{{ $t('notFoundEmployee') }}</p>
      </template>
      <template v-else>
        <employee-header v-if="mode !== 'add'" :employee="employee" />
        <b-row class="my-5">
          <b-col cols="12" md="6">
            <b-card>
              <team-selector :selected-team="selectedTeam" @update="updateTeam"></team-selector>
              <project-selector
                :selected-projects="selectedProjects"
                :customers="customers"
                @update-selected-projects="updateSelectedProjects"
              ></project-selector>
            </b-card>
          </b-col>

          <b-col cols="12" md="6">
            <b-card>
              <employee-settings
                :employee="employee"
                :is-admin="isAdmin"
                @changed="hasUnsavedChanges = true, errorMessage = null"
                @changed-admin="changedAdmin"
                @error-state="handleFormError"
              ></employee-settings>
            </b-card>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-end">
          <b-button variant="primary" :disabled="!hasUnsavedChanges" @click="saveEmployee">
            {{ $t('save') }}
            <b-icon icon="file-earmark-arrow-down" class="ml-1" />
          </b-button>
        </div>
        <b-row>
          <b-col cols="12" md="5">
            <b-alert :show="!!errorMessage" variant="danger" class="mt-3 w-4">
              {{ errorMessage }}
            </b-alert>
          </b-col>
        </b-row>
      </template>
    </section>
  </main>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
  useContext,
  useMeta,
  useRouter,
  useStore,
  watch,
} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value: string) => {
        return ['add', 'edit', 'view'].includes(value)
      }
    },
    employee: {
      type: Object as PropType<Employee>,
      required: false,
      default: null
    }
  },
  setup(props: { mode: string, employee: Employee }) {
    const {i18n, localePath} = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const projects = ref(props.employee?.projects);
    const selectedTeam = ref<string | null>(null);
    const selectedProjects = ref<(Project[] | undefined)>([]);
    const hasUnsavedChanges = ref<boolean>(false);
    const errorMessage = ref<string>("");

    const customers = computed(() => store.state.customers.customers);
    const isAdmin = ref<boolean>(
      store.getters["employees/adminList"].includes(props.employee?.email)
    );

    const pageTitle = computed(() =>
      props.employee ? `${i18n.t("employees")} - ${props.employee.name}` : i18n.t("addEmployee") as string
    );

    useMeta(() => ({title: pageTitle.value}));

    onMounted(() => {
      store.dispatch('customers/getCustomers');
      store.dispatch('employees/getAdminList');
      store.dispatch('employees/getTeamList');
    });

    watch(() => props.employee, () => {
      if (props.employee?.team) {
        selectedTeam.value = props.employee.team
      }
    }, {immediate: true})

    watch([projects, customers],
      () => {
        if (!props.employee?.projects || !customers.value.length) {
          selectedProjects.value = [];
          return;
        }

        selectedProjects.value = props.employee.projects.map((project: EmployeeProject) => {
          return {
            customer: customers.value.find((customer) => customer.id === project.customerId),
            contract: project.contract
          } as Project;
        });
      },
      {immediate: true, deep: true}
    );

    // We probably shouldn't watch a store getter imho
    watch(
      () =>
        store.getters["employees/adminList"].includes(props.employee?.email),
      () => {
        isAdmin.value = store.getters["employees/adminList"].includes(
          props.employee?.email
        );
      },
      {immediate: true}
    );

    const handleAdminToggle = (): void => {
      let valueChanged = false;
      let adminList = [...store.getters["employees/adminList"]];
      const email = props.employee?.email;
      const alreadyContained = adminList.includes(email);
      const adminValue = isAdmin.value;

      if (adminValue && !alreadyContained) {
        adminList.push(email);
        valueChanged = true;
      }
      if (!adminValue && alreadyContained) {
        adminList = adminList.filter((admin) => admin !== email);
        valueChanged = true;
      }

      // Only dispatch if value changed. Failsafe for spamming the checkbox.
      if (valueChanged) store.dispatch('employees/updateAdminList', adminList);
    };

    const saveEmployee = async () => {
      handleAdminToggle();

      const newEmployee = {
        ...props.employee,
        team: selectedTeam.value,
        projects: selectedProjects.value?.map((project: Project) => {
          return {
            customerId: project.customer.id,
            contract: project.contract
          } as EmployeeProject;
        }),
      };

      if (props.mode === 'edit') {
        await store.dispatch('employees/updateEmployee', newEmployee);
        hasUnsavedChanges.value = false;
      } else {
        await store.dispatch('employees/addNewEmployee', newEmployee);
        router.push(localePath('/admin/employees'));
      }
    };

    const updateTeam = (teamName: string) => {
      selectedTeam.value = teamName;
      hasUnsavedChanges.value = true;
    }

    const updateSelectedProjects = (list: Project[]) => {
      selectedProjects.value = list;
      hasUnsavedChanges.value = true;
    }

    const changedAdmin = (adminValue: boolean) => {
      isAdmin.value = adminValue;
      hasUnsavedChanges.value = true;
    }

    const handleFormError = (error: { message: string }) => {
      errorMessage.value = error.message;
    }

    return {
      updateTeam,
      updateSelectedProjects,
      isAdmin,
      customers,
      selectedProjects,
      selectedTeam,
      saveEmployee,
      hasUnsavedChanges,
      errorMessage,
      changedAdmin,
      handleFormError,
    };
  },
  head: {},
});
</script>
