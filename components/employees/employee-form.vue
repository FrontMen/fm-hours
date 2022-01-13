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
            <employee-settings :employee="employee"></employee-settings>
            <!--            <h6 class="mb-3">{{ $t('employeeSettings') }}</h6>-->

            <!--            {{ $t('name') }}:-->
            <!--            <b-form-input-->
            <!--              v-model="name"-->
            <!--              type="text"-->
            <!--              class="mt-2 w-75 mb-2"-->
            <!--              :placeholder="$t('employeeName')"-->
            <!--              :trim="true"-->
            <!--              :state="nameValidationState"-->
            <!--              @change="(nameTouched = true), (hasUnsavedChanges = true)"-->
            <!--            />-->

            <!--            {{ $t('email') }}:-->
            <!--            <b-form-input-->
            <!--              v-model="email"-->
            <!--              type="email"-->
            <!--              class="mt-2 w-75 mb-2"-->
            <!--              :placeholder="$t('employeeEmail')"-->
            <!--              :state="emailValidationState"-->
            <!--              :trim="true"-->
            <!--              @change="(emailTouched = true), (hasUnsavedChanges = true)"-->
            <!--            />-->

            <!--            <b-form-checkbox-->
            <!--              v-model="isAdmin"-->
            <!--              switch-->
            <!--              class="mt-2 mr-3"-->
            <!--              @change="hasUnsavedChanges = true"-->
            <!--            >-->
            <!--              {{ $t('admin') }}-->
            <!--            </b-form-checkbox>-->
            <!--            <b-form-checkbox-->
            <!--              v-model="isTravelAllowed"-->
            <!--              name="check-button"-->
            <!--              switch-->
            <!--              @change="hasUnsavedChanges = true"-->
            <!--            >-->
            <!--              {{ $t('travelAllowance') }}-->
            <!--            </b-form-checkbox>-->
            <!--            <b-form-checkbox-->
            <!--              v-model="standbyAllowed"-->
            <!--              switch-->
            <!--              class="mt-2 mr-3"-->
            <!--              @change="hasUnsavedChanges = true"-->
            <!--            >-->
            <!--              {{ $t('standBy') }}-->
            <!--            </b-form-checkbox>-->
            <!--            <label class="mt-2" for="start-datepicker">-->
            <!--              {{ $t('startDate') }}:-->
            <!--            </label>-->
            <!--            <b-form-datepicker-->
            <!--              id="start-datepicker"-->
            <!--              v-model="startDate"-->
            <!--              :locale="isoLocale"-->
            <!--              class="w-75 mb-2"-->
            <!--              :label-no-date-selected="$t('noDate')"-->
            <!--              @input="hasUnsavedChanges = true"-->
            <!--            />-->
            <!--            <b-form-checkbox-->
            <!--              v-model="hasEndDate"-->
            <!--              name="check-button"-->
            <!--              switch-->
            <!--              @change="hasUnsavedChanges = true"-->
            <!--            >-->
            <!--              {{ $t('endDate') }}:-->
            <!--            </b-form-checkbox>-->
            <!--            <b-form-datepicker-->
            <!--              id="end-datepicker"-->
            <!--              v-model="endDate"-->
            <!--              :locale="isoLocale"-->
            <!--              class="mt-2 w-75 mb-2"-->
            <!--              :disabled="!hasEndDate"-->
            <!--              :label-no-date-selected="$t('noDate')"-->
            <!--              @input="hasUnsavedChanges = true"-->
            <!--            />-->
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

import {formatDate, getDayOnGMT} from "~/helpers/dates";
import {emailRegex} from "~/helpers/email";

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
    const emailTouched = ref<boolean | null>(null);
    const nameTouched = ref<boolean | null>(null);

    const isoLocale = computed(() => {
      return i18n.localeProperties.iso;
    });

    const customers = computed(() => store.state.customers.customers);
    const isAdmin = ref<boolean>(
      store.getters["employees/adminList"].includes(props.employee?.email)
    );

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
      store.dispatch("customers/getCustomers");
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

    // How can this watcher being fired? Because we don't fetch this adminList while being on the page right?
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

    const saveEmployee = async () => {
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

    return {
      updateTeam,
      updateSelectedCustomers,
      isAdmin,
      customers,
      selectedCustomers,
      selectedTeam,
      saveEmployee,
      hasUnsavedChanges,
      isTravelAllowed,
      isoLocale,
      startDate,
      hasEndDate,
      endDate,
      errorMessage,
      deleteEmployee,
      standbyAllowed,
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
