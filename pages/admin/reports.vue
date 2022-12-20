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
        <reports-table
          :busy="isLoading || !$store.getters['reports/totalsItems']?.length"
          :items="$store.getters['reports/totalsItems']"
          :fields="$store.getters['reports/totalsFields']"
          :csv-file-name="`${$t('totals')}-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('projects')" lazy>
        <reports-table
          :busy="isLoading || !$store.getters['reports/projectItems'].length"
          :items="$store.getters['reports/projectItems']"
          :fields="$store.getters['reports/projectFields']"
          :csv-file-name="`projects-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('kilometers')" lazy>
        <reports-table
          :busy="isLoading || !$store.getters['reports/kilometerItems'].length"
          :items="$store.getters['reports/kilometerItems']"
          :fields="$store.getters['reports/kilometerFields']"
          :csv-file-name="`${$t('kilometers')}-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('standBy')" lazy>
        <reports-table
          :busy="isLoading || !$store.getters['reports/standByItems'].length"
          :items="$store.getters['reports/standByItems']"
          :fields="$store.getters['reports/standByFields']"
          :csv-file-name="`${$t('standBy')}-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('notBillable')" lazy>
        <reports-table
          :busy="isLoading || !$store.getters['reports/nonBillableFields'].length"
          :items="$store.getters['reports/nonBillableItems']"
          :fields="$store.getters['reports/nonBillableFields']"
          :csv-file-name="`${$t('notBillable')}-${formattedMonthDate}`"
        />
      </b-tab>
    </b-tabs>
  </admin-container>
</template>

<script lang="ts">
import {computed, defineComponent, ref, useContext, useMeta, useStore, watch,} from '@nuxtjs/composition-api';
import {addMonths, format, subMonths} from 'date-fns';

export default defineComponent({
  setup() {
    const {i18n} = useContext();

    useMeta(() => ({
      title: i18n.t('reports') as string,
    }));

    const monthDate = ref<Date>(new Date());

    const store = useStore<RootStoreState>();
    const isLoading = computed(() => store.state.reports.isLoading);

    const formattedMonthDate = computed(() =>
      format(monthDate.value as Date, 'MM-yyyy')
    );

    const goToPreviousMonth = () => {
      monthDate.value = subMonths(monthDate.value as Date, 1);
    };

    const goToNextMonth = () => {
      monthDate.value = addMonths(monthDate.value as Date, 1);
    };

    const goToCurrentMonth = () => {
      monthDate.value = new Date();
    };

    watch(
      monthDate,
      () => {
        store.dispatch('reports/getMonthlyReportData', {
          startDate: monthDate.value,
        });
      },
      {immediate: true}
    );

    return {
      monthDate,
      formattedMonthDate,
      isLoading,
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
