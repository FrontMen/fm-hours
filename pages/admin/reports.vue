<i18n lang="yaml">
en:
  totals: "Totals"
  standBy: "Stand-by"
  notBillable: "Not billable"
nl:
  totals: "Totalen"
  standBy: "Stand-by"
  notBillable: "Niet billable"
</i18n>

<template>
  <admin-container>
    <date-navigation-buttons
      class="mb-4"
      :selected-date="monthDate"
      @previous="goToPreviousMonth"
      @next="goToNextMonth"
      @current="goToCurrentMonth"
    />

    <b-tabs pills card>
      <b-tab :title="$t('totals')" active lazy>
        <totals-report :formatted-month-date="formattedMonthDate" />
      </b-tab>

      <b-tab :title="$t('projects')" lazy>
        <projects-report :formatted-month-date="formattedMonthDate" />
      </b-tab>

      <b-tab :title="$t('kilometers')" lazy>
        <kilometers-report :formatted-month-date="formattedMonthDate" />
      </b-tab>

      <b-tab :title="$t('standBy')" lazy>
        <stand-by-report :formatted-month-date="formattedMonthDate" />
      </b-tab>

      <b-tab :title="$t('notBillable')" lazy>
        <not-billable-report :formatted-month-date="formattedMonthDate" />
      </b-tab>
    </b-tabs>
  </admin-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  useContext,
  useMeta,
  useStore,
} from '@nuxtjs/composition-api';
import {addMonths, format, subMonths} from 'date-fns';
import NotBillableReport from "~/components/reports/not-billable-report.vue";
import StandByReport from "~/components/reports/stand-by-report.vue";
import KilometersReport from "~/components/reports/kilometers-report.vue";
import ProjectsReport from "~/components/reports/projects-report.vue";
import TotalsReport from "~/components/reports/totals-report.vue";

export default defineComponent({
  components: {TotalsReport, ProjectsReport, KilometersReport, StandByReport, NotBillableReport},
  setup() {
    const {i18n} = useContext();

    useMeta(() => ({
      title: i18n.t('reports') as string,
    }));

    const monthDate = ref<Date>(new Date());

    const store = useStore<RootStoreState>();

    const formattedMonthDate = computed(() =>
      format(monthDate.value as Date, 'MM-yyyy')
    );

    const goToPreviousMonth = () => {
      const startDate = subMonths(monthDate.value as Date, 1);
      store.dispatch('reports/getMonthlyReportData', {startDate});
      monthDate.value = startDate
    };

    const goToNextMonth = () => {
      const startDate = addMonths(monthDate.value as Date, 1);
      store.dispatch('reports/getMonthlyReportData', {startDate});
      monthDate.value = startDate;
    };

    const goToCurrentMonth = () => {
      const startDate = new Date();
      store.dispatch('reports/getMonthlyReportData', {startDate});
      monthDate.value = startDate;
    };

    onMounted(() => {
      store.dispatch('reports/getMonthlyReportData', {
        startDate: monthDate.value,
      });
    })

    return {
      monthDate,
      formattedMonthDate,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
    };
  },
  head: {
    title: 'Reports',
  },
});
</script>
