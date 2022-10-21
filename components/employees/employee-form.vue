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
                @changed="hasUnsavedChanges = true, errorMessage = null"
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

    const pageTitle = computed(() =>
      props.employee ? `${i18n.t("employees")} - ${props.employee.name}` : i18n.t("addEmployee") as string
    );

    useMeta(() => ({title: pageTitle.value}));

    onMounted(() => {
      store.dispatch('customers/getCustomers');
      store.dispatch('employees/getTeamList');
    });

    const updateProjectsList = () => {
      if (!props.employee?.projects || !customers.value.length) {
        selectedProjects.value = [];
        return;
      }

      function isNewStructure(project: string | EmployeeProject): project is EmployeeProject {
        return (project as EmployeeProject)?.customerId !== undefined;
      }

      selectedProjects.value = props.employee.projects.map((project: string | EmployeeProject) => {
        const customerId = isNewStructure(project) ? project.customerId : project;
        const customer = customers.value.find((customer) => customer.id === customerId)
        const contract = isNewStructure(project) ? project.contract : null

        return {
          customer,
          contract
        } as Project;
      });
    }

    watch(() => props.employee, () => {
      if (props.employee?.team) {
        selectedTeam.value = props.employee.team
      }
      updateProjectsList();
    }, {immediate: true})

    watch([projects, customers],
      () => {
        updateProjectsList();
      },
      {immediate: true, deep: true}
    );

    const saveEmployee = async () => {
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

    const handleFormError = (error: { message: string }) => {
      errorMessage.value = error.message;
    }

    return {
      updateTeam,
      updateSelectedProjects,
      customers,
      selectedProjects,
      selectedTeam,
      saveEmployee,
      hasUnsavedChanges,
      errorMessage,
      handleFormError,
    };
  },
  head: {},
});
</script>
