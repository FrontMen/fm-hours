<template>
  <div class="content-wrapper mt-5">
    <b-row>
      <b-col cols="12" sm="4" md="4" class="hide-print">
        <nuxt-link
          to="/"
          class="d-flex align-items-center flex-nowrap"
        >
          <b-button class="mb-3">
            <b-icon class="mr-1" icon="chevron-left" aria-hidden="true" />
            Back to week view
          </b-button>
        </nuxt-link>
        <b-button class="mb-3" @click="triggerPrint">
          <b-icon-printer /> &nbsp;Print
        </b-button>
      </b-col>
      <b-col cols="5" class="only-print mb-3">
        <img
          src="@/assets/images/logo-line.png"
          alt="frontmen logo"
          class="mt-0 mb-3 ml-0"
          width="250pt"
        >
        <h4><strong>{{ formatDate(monthDate) }} - {{ formatDate(endDate) }}</strong></h4>
      </b-col>
      <b-col cols="12" md="7" class="ml-auto">
        <b-row>
          <b-col cols="12" sm="6">
            <p><strong>Employee:</strong> {{ employee.name }}</p>
            <p>
              <strong v-if="selectedCustomers && selectedCustomers.length !== 1">Projects:</strong>
              <strong v-else>Project:</strong>
              <span v-if="selectedCustomers && selectedCustomers.length">
                <span v-for="(project, i) in selectedCustomers" :key="project.value">
                  {{ project.value }}<span v-if="i !== selectedCustomers.length - 1">,&nbsp;</span>
                </span>
              </span>
              <span v-if="!(selectedCustomers && selectedCustomers.length) && projectOptions && projectOptions.length">
                <span v-for="(project, i) in projectOptions" :key="project.value">
                  {{ project.value }}<span v-if="i !== projectOptions.length - 1">,&nbsp;</span>
                </span>
              </span>
            </p>
          </b-col>
          <b-col cols="12" sm="6">
            <p><strong>Total hours:</strong> {{ totalHours.total }}</p>
            <p><strong>Total billable hours:</strong> {{ totalHours.billable }}</p>
            <p><strong>Total for selected projects:</strong> {{ totalHours.selected }}</p>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="12" sm="12" md="5" class="mb-3 mt-auto hide-print">
        <month-navigation-buttons
          :selected-date="monthDate"
          @previous="goToPreviousMonth"
          @next="goToNextMonth"
          @current="goToCurrentMonth"
        />
      </b-col>
      <b-col cols="4" md="3" class="mb-3 mt-auto hide-print">
        <label class="employee-status__label" for="customer-select">
          <strong>Filter by customer:</strong>
        </label>
        <multiselect
          id="customer-select"
          v-model="selectedCustomers"
          track-by="value"
          label="label"
          class="customer-select__wrapper"
          :options="projectOptions"
          :close-on-select="false"
          :multiple="true"
          :taggable="false"
          placeholder="Select projects"
        >
          <template slot="selection" slot-scope="{ values }">
            <span v-if="values.length">
              {{ values.length }} options selected
            </span>
          </template>
        </multiselect>
      </b-col>
      <b-col cols="3" class="mt-auto mb-3 hide-print">
        <b-form-checkbox v-model="onlyBillable" switch class=" mr-3 ml-auto">
          Only billable
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-table
      responsive
      striped
      head-variant="dark"
      table-variant="light"
      foot-variant="light"
      sort-by="date"
      :sort-desc="true"
      :items="monthReport"
      :fields="['customer', 'debtor', 'date', 'hours']"
      foot-clone
      show-empty
    >
      <template #head(debtor)="scope">
        <span class="hide-print">{{ scope.label }}</span>
      </template>

      <template #empty>
        <p>No records available for selected month</p>
      </template>
      <template #cell(customer)="scope">
        {{ scope.item.customer.name }}
        <b-badge v-if="scope.item.customer.isBillable" variant="success" class="hide-print">
          Billable
        </b-badge>
      </template>
      <template #cell(debtor)="scope">
        <span class="hide-print">{{ scope.item.customer.debtor }}</span>
      </template>
      <template #cell(date)="scope">
        {{ formatDate(scope.item.date ) }}
      </template>
      <template #cell(hours)="scope">
        {{ parseFloat(scope.item.hours).toPrecision(3) }}
      </template>

      <template #foot(hours)="scope">
        <span><strong>Total hours:</strong> {{ totalHours.selected }}</span>
      </template>
      <template #foot()="scope">
        &nbsp;
      </template>
    </b-table>

    <b-row class="no-break only-print">
      <b-col cols="6">
        Approved by
        <br>
        Date:
        <br>
        <br>
        <br>
        __________________________________________
        <br>
      </b-col>
      <b-col cols="6" class="mt-auto">
        <br>
        <br>
        <br>
        <br>
        __________________________________________
        <br>
        {{ employee.name }}
        <br>
        <br>
        <img
          src="@/assets/images/logo-line.png"
          alt="frontmen logo"
          width="250pt"
        >
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, ref, useStore, watch,
} from "@nuxtjs/composition-api";
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from "date-fns";
import Multiselect from "vue-multiselect";

export default defineComponent({
  components: { Multiselect },
  middleware: ["isAuthenticated"],
  head: {
    title: "Monthly report",
  },

  setup() {
    const store = useStore<RootStoreState>();

    const selectedCustomers = ref<{value: string; label: string;}[]>([]);
    const onlyBillable= ref<boolean>(false);

    const employee = computed(() => {
      return store.state.employee.employee;
    });

    const getRecords = () => {
        const startDate = monthDate.value;

        store.dispatch("records/getMonthlyTimeRecords", {
          employeeId: store.state.employee.employee!.id,
          startDate,
          endDate,
        });
    };

    const monthDate = ref<Date>(startOfMonth(new Date()));
    let endDate: Date = endOfMonth(monthDate.value);
    watch([monthDate, employee],
      () => {
        endDate = endOfMonth(monthDate.value);
        getRecords();
      },
      {
        immediate: true,
      },
    );

    const monthReport = computed(() => {
      let filteredRecords = store.state.records.timeRecords;

      filteredRecords = handleFilterBillable(filteredRecords);
      filteredRecords = handleSelectedProjects(filteredRecords);

      return filteredRecords;
    });

    const getTotals = (records: TimeRecord[]): number => {
      return records.reduce((total, record) => {
        return total + record.hours;
      }, 0);
    };

    const totalHours = computed(() => {
      const records = [...store.state.records.timeRecords];
      const billableRecords = handleFilterBillable(records, true);
      const conditionalBillable = handleFilterBillable(records);
      const selectedBillable = handleSelectedProjects(conditionalBillable);

      const totals = {
        billable: getTotals(billableRecords),
        selected: getTotals(selectedBillable),
        total: getTotals(records),
      };

      return totals;
    });

    const projectOptions = computed(() => {
      let records = [...store.state.records.timeRecords];
      records = handleFilterBillable(records);
      const projects:string[] = [];

      records.forEach(record => {
        if(!projects.includes(record.customer.name)) projects.push(record.customer.name);
      });

      const mappedProjects = projects.map((project) => { return {value: project, label: project}});

      return mappedProjects;
    });

    store.dispatch("reports/getMonthlyReportData", {
      startDate: monthDate.value,
    });

    const handleFilterBillable = (records: TimeRecord[], force: boolean = false): TimeRecord[] => {
      const filtered = [...records];
      return onlyBillable.value || force ? filtered.filter((record) => record && record.customer.isBillable) : filtered;
    }

    const handleSelectedProjects = (records: TimeRecord[]): TimeRecord[] => {
      let filtered = [...records];
      if (selectedCustomers.value.length) {
        const mappedSelected = selectedCustomers.value.map(item => item.value);
        filtered = records.filter((record) => record && mappedSelected.includes(record.customer.name));
      }
      return filtered;
    }

    const formatDate = (dateTime: number): string => {
      return format(dateTime, "dd-MMMM-yyyy");
    }

    const goToPreviousMonth = () => {
      monthDate.value = subMonths(monthDate.value, 1);
    };

    const goToNextMonth = () => {
      monthDate.value = addMonths(monthDate.value, 1);
    };

    const goToCurrentMonth = () => {
      monthDate.value = startOfMonth(new Date());
    };

    const triggerPrint = () => {
      window.print();
    }

    return {
      employee,
      endDate,
      formatDate,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
      monthReport,
      monthDate,
      onlyBillable,
      projectOptions,
      selectedCustomers,
      totalHours,
      triggerPrint,
    };
  }
});

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss" scoped>
  @media screen{
    .only-print {
      display: none;
    }
  }
  @media print {
    .no-break {
      page-break-inside: avoid;
    }

    .hide-print {
      display: none;
    }
  }
</style>
