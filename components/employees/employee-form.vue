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
          <b-col cols="12" md="5">
            <team-selector
              :selected-team="selectedTeam"
              @update="updateTeam"
            ></team-selector>
            <project-selector
              :selected-customers="selectedCustomers"
              :customers="customers"
              @update-selected-customers="updateSelectedCustomers"
            ></project-selector>
          </b-col>

          <b-col md="1" />

          <b-col cols="12" md="6">
            <employee-settings
              :employee="employee"
              :is-admin="isAdmin"
              @changed="hasUnsavedChanges = true, errorMessage = null"
              @error-state="handleFormError"
            ></employee-settings>
          </b-col>
        </b-row>
        <b-button :disabled="!hasUnsavedChanges" @click="saveEmployee">
          {{ $t('save') }}
        </b-button>
        <b-button v-if="employee" variant="danger" @click="deleteEmployee">
          {{ $t('delete') }}
        </b-button>
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

    const selectedCustomers = ref<(Customer | undefined)[]>([]);
    const hasUnsavedChanges = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const selectedTeam = ref<string | null>(null);

    const customers = computed(() => store.state.customers.customers);
    const isAdmin = ref<boolean>(
      store.getters["employees/adminList"].includes(props.employee?.email)
    );

    const pageTitle = computed(() =>
      props.employee ? `${i18n.t("employees")} - ${props.employee.name}` : i18n.t("addEmployee") as string
    );

    useMeta(() => ({title: pageTitle.value}));

    onMounted(() => {
      store.dispatch("customers/getCustomers");
      store.dispatch("employees/getAdminList");
      store.dispatch("employees/getTeamList");
    });

    watch(
      () => [props.employee?.projects, customers.value],
      () => {
        selectedCustomers.value =
          props.employee?.projects && customers.value.length
            ? props.employee.projects.map((project) =>
              customers.value.find((customer) => customer.id === project)
            )
            : [];
      },
      {immediate: true}
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
      if (valueChanged) store.dispatch("employees/updateAdminList", adminList);
    };

    const saveEmployee = async () => {
      handleAdminToggle();

      const newEmployee = {
        ...props.employee,
        team: selectedTeam.value,
        projects: selectedCustomers.value.map((customer) => customer!.id),
      };


      if (props.mode === 'edit') {
        await store.dispatch("employees/updateEmployee", newEmployee);
      } else {
        await store.dispatch('employees/addNewEmployee', newEmployee)
      }

      hasUnsavedChanges.value = false;
    };

    const deleteEmployee = async () => {
      const confirmation = confirm(
        i18n.t('confirmDelete', {name: props.employee?.name}) as string
      );

      if (!confirmation) return;

      const confirmation2 = confirm(
        i18n.t('reConfirmDelete', {name: props.employee?.name}) as string
      );

      if (!confirmation2) return;

      await store.dispatch("employees/deleteEmployee", props.employee?.id);
      router.push(localePath("/admin/employees"));
    };

    const updateTeam = (teamName: string) => {
      selectedTeam.value = teamName;
      hasUnsavedChanges.value = true;
    }

    const updateSelectedCustomers = (list: Customer[]) => {
      selectedCustomers.value = list;
      hasUnsavedChanges.value = true;
    }

    const handleFormError = (error: { message: string }) => {
      errorMessage.value = error.message;
    }

    return {
      updateTeam,
      updateSelectedCustomers,
      isAdmin,
      customers,
      selectedCustomers,
      selectedTeam,
      saveEmployee,
      hasUnsavedChanges,
      errorMessage,
      deleteEmployee,
      handleFormError,
    };
  },
  head: {},
});
</script>
