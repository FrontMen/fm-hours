<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container fluid class="app-table">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Employees</span>
          </b-col>
        </b-row>

        <timesheet-employee-row
          v-for="employee in employees"
          :key="employee.id"
          :employee="employee"
          @click="openEmployeeTimesheetPage(employee)"
        />
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";

import TimesheetEmployeeRow from "~/components/timesheets/timesheet-employee-row.vue";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  middleware: ["isAdmin"],
  components: { TimesheetEmployeeRow },

  head: {
    title: "Timesheets",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const employees = computed(() => store.state.timesheets.employees);
    store.dispatch("timesheets/getEmployeeList");

    const router = useRouter();
    const openEmployeeTimesheetPage = (employee: TimesheetEmployee) => {
      router.push(`timesheets/${employee.id}`);
    };

    return {
      employees,
      recordStatus,
      openEmployeeTimesheetPage,
    };
  },
});
</script>
