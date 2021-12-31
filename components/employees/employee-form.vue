<i18n lang="yaml">
en:
  notFoundEmployee: "Employee not found"
  editTeam: "Edit team"
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
  editTeam: "Team bewerken"
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
      <template v-if="mode === 'edit' && !employee">
        <p>{{ $t('notFoundEmployee') }}</p>
      </template>
      <template v-else>
        <employee-header v-if="mode === 'edit'" :employee="employee" />
        <b-row class="my-5">
          <b-col cols="12" md="5">
            <h6 class="mb-3">{{ $t('editTeam') }}:</h6>
            <b-form-select
              v-model="selectedTeam"
              :options="teamList"
              class="mb-3"
              @change="hasUnsavedChanges = true"
            />
            <h6 class="mb-3">{{ $t('manageProjects') }}</h6>
            <multiselect
              v-model="selectedCustomers"
              track-by="id"
              label="label"
              class="mb-3"
              :options="customerOptions"
              :close-on-select="false"
              :multiple="true"
              :taggable="false"
              :placeholder="$t('customerSearchPlaceholder')"
              @input="hasUnsavedChanges = true"
            >
              <template slot="selection" slot-scope="{values}">
                <span v-if="values.length" class="multiselect__single">
                  {{ $t('noOptions', {num: values.length}) }}
                </span>
              </template>
            </multiselect>

            <b-table
              :items="items"
              :fields="['name', 'debtor', 'delete']"
              class="rounded"
              small
              striped
              table-variant="light"
            >
              <template #cell(delete)="row">
                <b-button
                  size="sm"
                  variant="danger"
                  :disabled="row.item.isDefault"
                  @click="handleProjectDelete(row.item.id)"
                >
                  <b-icon-trash-fill />
                </b-button>
              </template>
            </b-table>
          </b-col>

          <b-col md="1" />

          <b-col cols="12" md="6">
            <h6 class="mb-3">{{ $t('employeeSettings') }}</h6>

            {{ $t('name') }}:
            <b-form-input
              v-model="name"
              type="text"
              class="mt-2 w-75 mb-2"
              :placeholder="$t('employeeName')"
              :trim="true"
              :state="nameValidationState"
              @change="(nameTouched = true), (hasUnsavedChanges = true)"
            />

            {{ $t('email') }}:
            <b-form-input
              v-model="email"
              type="email"
              class="mt-2 w-75 mb-2"
              :placeholder="$t('employeeEmail')"
              :state="emailValidationState"
              :trim="true"
              @change="(emailTouched = true), (hasUnsavedChanges = true)"
            />

            <b-form-checkbox
              v-model="isAdmin"
              switch
              class="mt-2 mr-3"
              @change="hasUnsavedChanges = true"
            >
              {{ $t('admin') }}
            </b-form-checkbox>
            <b-form-checkbox
              v-model="isTravelAllowed"
              name="check-button"
              switch
              @change="hasUnsavedChanges = true"
            >
              {{ $t('travelAllowance') }}
            </b-form-checkbox>
            <b-form-checkbox
              v-model="standbyAllowed"
              switch
              class="mt-2 mr-3"
              @change="hasUnsavedChanges = true"
            >
              {{ $t('standBy') }}
            </b-form-checkbox>
            <label class="mt-2" for="start-datepicker">
              {{ $t('startDate') }}:
            </label>
            <b-form-datepicker
              id="start-datepicker"
              v-model="startDate"
              :locale="isoLocale"
              class="w-75 mb-2"
              :label-no-date-selected="$t('noDate')"
              @input="hasUnsavedChanges = true"
            />
            <b-form-checkbox
              v-model="hasEndDate"
              name="check-button"
              switch
              @change="hasUnsavedChanges = true"
            >
              {{ $t('endDate') }}:
            </b-form-checkbox>
            <b-form-datepicker
              id="end-datepicker"
              v-model="endDate"
              :locale="isoLocale"
              class="mt-2 w-75 mb-2"
              :disabled="!hasEndDate"
              :label-no-date-selected="$t('noDate')"
              @input="hasUnsavedChanges = true"
            />
          </b-col>
        </b-row>
        <b-button :disabled="!hasUnsavedChanges" @click="saveProjects">
          {{ $t('save') }}
        </b-button>
        <b-button
          v-if="employee"
          variant="danger"
          @click="handleEmployeeDelete"
        >
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

import {formatDate, getDayOnGMT} from "~/helpers/dates";
import {emailRegex} from "~/helpers/email";

export default defineComponent({
  middleware: ["isAdmin"],
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
    const emailTouched = ref<boolean | null>(null);
    const nameTouched = ref<boolean | null>(null);

    const isoLocale = computed(() => {
      return i18n.localeProperties.iso;
    });

    const customers = computed(() => store.state.customers.customers);
    const customerOptions = computed(() =>
      customers.value
        .filter((customer) => !customer.isDefault && !customer.archived)
        .map((customer) => ({
          ...customer,
          label: `${customer.name} (${customer.debtor})`,
        }))
    );
    const defaultCustomers = computed(
      () => store.getters["customers/defaultCustomers"]
    );

    const employeeId = router.currentRoute.params.id;
    const employees = computed(() => store.state.employees.employees);

    const teamList = computed(() => {
      const parsedTeam = store.getters["employees/teamList"].map(
        (team: string) => {
          return {value: team, text: team};
        }
      );
      return [{value: null, text: i18n.t("selectTeam")}, ...parsedTeam];
    });

    const pageTitle = computed(() =>
      props.employee ? `${i18n.t("employees")} - ${props.employee.name}` : i18n.t("addEmployee") as string
    );

    const emailValidationState = computed(() => {
      if (!emailTouched.value) {
        return null;
      } else if (!email.value?.match(emailRegex)) {
        return false;
      }

      return true;
    });

    const nameValidationState = computed(() => {
      if (!nameTouched.value) {
        return null;
      } else if (!name.value) {
        return false;
      }

      return true;
    });

    useMeta(() => ({title: pageTitle.value}));

    onMounted(() => {
      if (employees.value.length === 0) {
        store.dispatch("employees/getEmployees");
      }

      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }

      store.dispatch("employees/getAdminList");
      store.dispatch("employees/getTeamList");

      if (props.employee?.endDate) {
        hasEndDate.value = true;
        endDate.value = formatDate(getDayOnGMT(props.employee.endDate));
      }
    });

    watch(
      () => props.employee?.team,
      () => {
        selectedTeam.value = props.employee?.team || null;
      },
      {immediate: true}
    );

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

    const isAdmin = ref<boolean>(
      store.getters["employees/adminList"].includes(props.employee?.email)
    );
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

    const standbyAllowed = ref<boolean>(!!props.employee?.standBy);
    watch(
      () => props.employee?.standBy,
      () => {
        standbyAllowed.value = !!props.employee?.standBy;
      },
      {immediate: true}
    );


    const isTravelAllowed = ref<boolean>(!!props.employee?.travelAllowance);
    watch(
      () => props.employee?.travelAllowance,
      () => {
        isTravelAllowed.value = !!props.employee?.travelAllowance;
      },
      {immediate: true}
    );

    const startDate = ref<string>(
      props.employee ? formatDate(getDayOnGMT(props.employee.startDate)) : ""
    );
    watch(
      () => props.employee?.startDate,
      () => {
        startDate.value = props.employee
          ? formatDate(getDayOnGMT(props.employee.startDate))
          : "";
      },
      {immediate: true}
    );

    const hasEndDate = ref(!!props.employee?.endDate);
    const endDate = ref<string | null>(null);

    watch(
      () => props.employee,
      () => {
        if (props.employee?.endDate) {
          hasEndDate.value = true;
          endDate.value = formatDate(getDayOnGMT(props.employee.endDate));
        }
      }
    );

    watch(
      () => hasEndDate.value,
      () => {
        if (!hasEndDate.value) {
          endDate.value = null;
          errorMessage.value = "";
        }
      }
    );

    watch(
      () => endDate.value,
      () => {
        if (endDate.value) {
          errorMessage.value = "";
        }
      }
    );

    const name = ref<String | undefined>(props.employee?.name);
    watch(
      () => props.employee?.name,
      () => {
        name.value = props.employee?.name;
      }
    );

    const email = ref<String | undefined>(props.employee?.email);
    watch(
      () => props.employee?.email,
      () => {
        email.value = props.employee?.email;
      }
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

    const saveProjects = async () => {
      nameTouched.value = true;
      emailTouched.value = true;

      if (!(emailValidationState.value && nameValidationState.value)) {
        errorMessage.value = i18n.t('errorNameEmail') as string;
        return;
      }

      if (!startDate.value) {
        errorMessage.value = i18n.t('errorStartDate') as string;
        return;
      }

      if (hasEndDate.value && !endDate.value) {
        errorMessage.value = i18n.t('errorEndDate') as string;
        return;
      }

      handleAdminToggle();
      const newEmployee = {
        ...props.employee,
        name: name.value,
        email: email.value,
        team: selectedTeam.value,
        standBy: standbyAllowed.value,
        projects: selectedCustomers.value.map((customer) => customer!.id),
        travelAllowance: isTravelAllowed.value,
        startDate: new Date(startDate.value).getTime(),
        endDate: endDate?.value ? new Date(endDate.value).getTime() : null,
      };


      if (props.mode === 'edit') {
        await store.dispatch("employees/updateEmployee", newEmployee);
      } else {
        await store.dispatch('employees/addNewEmployee', newEmployee)
      }

      hasUnsavedChanges.value = false;
      nameTouched.value = null;
      emailTouched.value = null;
    };

    const handleEmployeeDelete = async () => {
      const confirmation = confirm(
        i18n.t('confirmDelete', {name: props.employee?.name}) as string
      );

      if (!confirmation) return;

      const confirmation2 = confirm(
        i18n.t('reConfirmDelete', {name: props.employee?.name}) as string
      );

      if (!confirmation2) return;

      await store.dispatch("employees/deleteEmployee", employeeId);
      router.push(localePath("/admin/employees"));
    };

    const handleProjectDelete = (customerId: string) => {
      selectedCustomers.value = selectedCustomers.value.filter(
        (customer) => customer!.id !== customerId
      );
    };

    const items = computed(() => [
      ...selectedCustomers.value,
      ...defaultCustomers.value,
    ]);

    return {
      isAdmin,
      customerOptions,
      selectedCustomers,
      selectedTeam,
      saveProjects,
      hasUnsavedChanges,
      isTravelAllowed,
      isoLocale,
      startDate,
      hasEndDate,
      endDate,
      errorMessage,
      handleProjectDelete,
      defaultCustomers,
      items,
      handleEmployeeDelete,
      standbyAllowed,
      teamList,
      name,
      nameValidationState,
      nameTouched,
      email,
      emailValidationState,
      emailTouched,
    };
  },
  head: {},
});
</script>
