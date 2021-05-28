<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <div v-if="!employee">Employee not found</div>

      <div v-else>
        <employee-header :employee="employee" />

        <b-row class="my-5">
          <b-col cols="12" md="5">
            <h6 class="mb-3">Manage Projects</h6>
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
                <span v-if="values.length" class="multiselect__single"
                  >{{ values.length }} options selected</span
                >
              </template>
            </multiselect>

            <b-table
              :items="selectedCustomers"
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
                  @click="handleProjectDelete(row.item.id)"
                >
                  <b-icon-trash-fill />
                </b-button>
              </template>
            </b-table>
          </b-col>

          <b-col md="1" />

          <b-col cols="12" md="6">
            <h6 class="mb-3">Employee Settings</h6>
            <b-form-checkbox
              v-model="isTravelAllowed"
              name="check-button"
              switch
              @change="hasUnsavedChanges = true"
            >
              Travel allowance
            </b-form-checkbox>
            <b-form-checkbox
              v-model="isEmployeeActive"
              name="check-button"
              switch
              @change="hasUnsavedChanges = true"
            >
              Active employee
            </b-form-checkbox>
            <label class="mt-2" for="start-datepicker">Start date:</label>
            <b-form-datepicker
              id="start-datepicker"
              v-model="startDate"
              class="w-75 mb-2"
              @input="hasUnsavedChanges = true"
            />
          </b-col>
        </b-row>

        <b-button :disabled="!hasUnsavedChanges" @click="saveProjects">
          Save
        </b-button>
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

    const customers = computed(() => store.state.customers.customers);
    const customerOptions = computed(() =>
      customers.value.map((customer) => ({
        ...customer,
        label: `${customer.name} (${customer.debtor})`,
      }))
    );

    const employeeId = router.currentRoute.params.employee_id;
    const employees = computed(() => store.state.employees.employees);
    const employee = computed(() =>
      employees.value.find((x) => x.id === employeeId)
    );

    useMeta({ title: `Employees - ${employee.value?.name}` });

    onMounted(() => {
      if (employees.value.length === 0) {
        store.dispatch("employees/getEmployees");
      }

      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
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

    const isTravelAllowed = ref<boolean>(!!employee.value?.travelAllowance);
    watch(
      () => employee.value?.travelAllowance,
      () => {
        isTravelAllowed.value = !!employee.value?.travelAllowance;
      },
      { immediate: true }
    );

    const isEmployeeActive = ref<boolean>(!employee.value?.endDate);
    watch(
      () => employee.value?.endDate,
      () => {
        isEmployeeActive.value = !employee.value?.endDate;
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

    const saveProjects = () => {
      if (!employee.value) return;

      const newEmployee = {
        ...employee.value,
        projects: selectedCustomers.value.map((customer) => customer!.id),
        travelAllowance: isTravelAllowed.value,
        startDate: new Date(startDate.value).getTime(),
      };

      const hasActivationChanged =
        !!employee.value.endDate === isEmployeeActive.value;

      if (hasActivationChanged && !isEmployeeActive.value) {
        newEmployee.endDate = new Date().getTime();
      }

      if (hasActivationChanged && isEmployeeActive.value) {
        newEmployee.endDate = null;
      }

      store.dispatch("employees/updateEmployee", newEmployee);

      hasUnsavedChanges.value = false;
    };

    const handleProjectDelete = (customerId: string) => {
      selectedCustomers.value = selectedCustomers.value.filter(
        (customer) => customer!.id !== customerId
      );
    };

    const fields = ["name", "debtor", "delete"];

    return {
      employee,
      customerOptions,
      selectedCustomers,
      saveProjects,
      hasUnsavedChanges,
      isTravelAllowed,
      isEmployeeActive,
      startDate,
      fields,
      handleProjectDelete,
    };
  },
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
