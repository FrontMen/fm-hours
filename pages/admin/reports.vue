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
      :selected-date="$store.state.reports.startDate"
      @previous="goToPreviousMonth"
      @next="goToNextMonth"
      @current="goToCurrentMonth"
    />

    <b-tabs pills card>
      <b-tab :title="$t('totals')" active lazy>
        <totals-report />
      </b-tab>

      <b-tab :title="$t('projects')" lazy>
        <projects-report />
      </b-tab>

      <b-tab :title="$t('kilometers')" lazy>
        <kilometers-report />
      </b-tab>

      <b-tab :title="$t('standBy')" lazy>
        <stand-by-report />
      </b-tab>

      <b-tab :title="$t('notBillable')" lazy>
        <not-billable-report />
      </b-tab>
    </b-tabs>
  </admin-container>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  useContext,
  useMeta,
  useStore,
} from '@nuxtjs/composition-api';
import {addMonths, subMonths} from 'date-fns';

export default defineComponent({
  setup() {
    const {i18n} = useContext();

    useMeta(() => ({
      title: i18n.t('reports') as string,
    }));

    const store = useStore<RootStoreState>();

    const goToPreviousMonth = async () => {
      const startDate = subMonths(store.state.reports.startDate, 1);
      await store.dispatch('reports/getMonthlyReportData', {startDate});
      store.commit('reports/setStartDate', startDate);
    };

    const goToNextMonth = async () => {
      const startDate = addMonths(store.state.reports.startDate, 1);
      await store.dispatch('reports/getMonthlyReportData', {startDate});
      store.commit('reports/setStartDate', startDate);
    };

    const goToCurrentMonth = async () => {
      const startDate = new Date();
      await store.dispatch('reports/getMonthlyReportData', {startDate});
      store.commit('reports/setStartDate', startDate);
    };

    onMounted(() => {
      store.dispatch('reports/getMonthlyReportData', {
        startDate: store.state.reports.startDate,
      });
    })

    return {
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
