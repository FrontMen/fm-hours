<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <div v-if="!employee">
        Employee not found
      </div>

      <div v-else>
        <employee-header :employee="employee" />

        <b-row class="my-5">
          <b-col cols="12" md="5">
            <h6 class="mb-3">
              Manage Projects
            </h6>
            <multiselect
              v-model="selectedCustomers"
              track-by="id"
              label="label"
              class="mb-3"
              :options="customerOptions"
              :close-on-select="false"
              :multiple="true"
              :taggable="false"
              placeholder="Click or search for a customer here"
              @input="hasUnsavedChanges = true"
            >
              <template slot="selection" slot-scope="{ values }">
                <span
                  v-if="values.length"
                  class="multiselect__single"
                >{{ values.length }} options selected</span>
              </template>
            </multiselect>

            <b-table
              :items="items"
              :fields="fields"
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
            <h6 class="mb-3">
              Employee Settings
            </h6>
            <b-form-checkbox v-model="isAdmin" switch class="mt-2 mr-3" @change="hasUnsavedChanges = true">
              Admin
            </b-form-checkbox>
            <b-form-checkbox
              v-model="isTravelAllowed"
              name="check-button"
              switch
              @change="hasUnsavedChanges = true"
            >
              Travel allowance
            </b-form-checkbox>
            <label class="mt-2" for="start-datepicker">Start date:</label>
            <b-form-datepicker
              id="start-datepicker"
              v-model="startDate"
              class="w-75 mb-2"
              @input="hasUnsavedChanges = true"
            />
            <b-form-checkbox
              v-model="hasEndDate"
              name="check-button"
              switch
              @change="hasUnsavedChanges = true"
            >
              End date:
            </b-form-checkbox>
            <b-form-datepicker
              id="end-datepicker"
              v-model="endDate"
              class="mt-2 w-75 mb-2"
              :disabled="!hasEndDate"
              @input="hasUnsavedChanges = true"
            />
          </b-col>
        </b-row>
        <b-button :disabled="!hasUnsavedChanges" @click="saveProjects">
          Save
        </b-button>
        <b-row>
          <b-col cols="12" md="5">
            <b-alert :show="!!errorMessage" variant="danger" class="mt-3 w-4">
              {{ errorMessage }}
            </b-alert>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  useStore,
  useRouter,
  useMeta,
  watch,
  ref,
} from "@nuxtjs/composition-api";
import Multiselect from "vue-multiselect";
import { BIconTrashFill } from "bootstrap-vue";

import EmployeeHeader from "~/components/app/employee-header.vue";
import { formatDate, getDayOnGMT } from "~/helpers/dates";

export default defineComponent({
  components: { EmployeeHeader, Multiselect, BIconTrashFill },
  middleware: ["isAdmin"],
  head: {},
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const selectedCustomers = ref<(Customer | undefined)[]>([]);
    const hasUnsavedChanges = ref<boolean>(false);
    const errorMessage = ref("")

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

    const employeeId = router.currentRoute.params.employee_id;
    const employees = computed(() => store.state.employees.employees);
    const employee = computed(() =>
      employees.value.find((x) => x.id === employeeId)
    );

    const pageTitle = computed(() =>
      employee.value ? `Employees - ${employee.value?.name}` : "Employees"
    );

    useMeta(() => ({ title: pageTitle.value }));

    onMounted(() => {
      if (employees.value.length === 0) {
        store.dispatch("employees/getEmployees");
      }

      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }

      if (store.getters["employees/adminList"].length === 0) {
        store.dispatch("employees/getAdminList");
      }

      if (employee?.value?.endDate) {
        hasEndDate.value = true
        endDate.value = formatDate(getDayOnGMT(employee.value.endDate))
      } 
    });

    watch(
      () => [employee.value?.projects, customers.value],
      () => {
        selectedCustomers.value =
          employee.value?.projects && customers.value.length
            ? employee.value.projects.map((project) =>
                customers.value.find((customer) => customer.id === project)
              )
            : [];
      },
      { immediate: true }
    );

    const isAdmin = ref<boolean>(store.getters["employees/adminList"].includes(employee.value?.email));
    watch(
      () => store.getters["employees/adminList"].includes(employee.value?.email),
      () => {
        isAdmin.value = store.getters["employees/adminList"].includes(employee.value?.email);
      },
      { immediate: true }
    );

    const isTravelAllowed = ref<boolean>(!!employee.value?.travelAllowance);
    watch(
      () => employee.value?.travelAllowance,
      () => {
        isTravelAllowed.value = !!employee.value?.travelAllowance;
      },
      { immediate: true }
    );

    const startDate = ref<string>(
      employee.value ? formatDate(getDayOnGMT(employee.value.startDate)) : ""
    );
    watch(
      () => employee.value?.startDate,
      () => {
        startDate.value = employee.value
          ? formatDate(getDayOnGMT(employee.value.startDate))
          : "";
      },
      { immediate: true }
    );

    const hasEndDate = ref(!!employee?.value?.endDate);
    const endDate = ref<string | null>(null);

    watch(() => employee.value, () => {
      if (employee?.value?.endDate) {
          hasEndDate.value = true
          endDate.value = formatDate(getDayOnGMT(employee.value.endDate))
        } 
    })

    watch(() => hasEndDate.value, () => {
      if (!hasEndDate.value) {
          endDate.value = null
          errorMessage.value = ""
        } 
    })

    watch(() => endDate.value, () => {
      if (endDate.value) {
        errorMessage.value = ""
      }
    })
  
    const handleAdminToggle = (): void => {
      let valueChanged = false;
      let adminList = [...store.getters["employees/adminList"]];
      const email = employee.value?.email;
      const alreadyContained = adminList.includes(email);
      const adminValue = isAdmin.value;

      if (adminValue && !alreadyContained) {
        adminList.push(email);
        valueChanged = true;
      }
      if (!adminValue && alreadyContained) {
        adminList = adminList.filter(admin => admin !== email);
        valueChanged = true;
      }

      // Only dispatch if value changed. Failsafe for spamming the checkbox.
      if (valueChanged) store.dispatch("employees/updateAdminList", adminList);
    }

    const saveProjects = () => {
      if (!employee.value) return;

      if (hasEndDate.value && !endDate.value) {
        errorMessage.value = "Please select an end date"
        return
      }
      
      handleAdminToggle();

      const newEmployee = {
        ...employee.value,
        projects: selectedCustomers.value.map((customer) => customer!.id),
        travelAllowance: isTravelAllowed.value,
        startDate: new Date(startDate.value).getTime(),
        endDate: endDate?.value ? new Date(endDate.value).getTime() : null,
      };

      store.dispatch("employees/updateEmployee", newEmployee);

      hasUnsavedChanges.value = false;
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

    const fields = ["name", "debtor", "delete"];

    return {
      isAdmin,
      employee,
      customerOptions,
      selectedCustomers,
      saveProjects,
      hasUnsavedChanges,
      isTravelAllowed,
      startDate,
      hasEndDate,
      endDate,
      errorMessage,
      fields,
      handleProjectDelete,
      defaultCustomers,
      items,
    };
  },
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
