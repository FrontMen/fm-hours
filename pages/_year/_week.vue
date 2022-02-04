<template>
  <div class="mt-5 content-wrapper">
    <weekly-timesheet
      v-if="employee && year && week"
      :employee="employee"
      :year="year"
      :week="week"
    />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, useContext, useMeta, useRouter, useStore,} from '@nuxtjs/composition-api';
import {format} from "date-fns";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const employee = computed(() => store.state.employee.employee);
    const year = computed(() => parseInt(router.currentRoute.params.year, 10));
    const week = computed(() => parseInt(router.currentRoute.params.week, 10));
    const pageTitle = computed(() => `${i18n.t('timesheets')} - ${employee.value?.name}`);

    if (!employee.value?.billable) {
      router.push(store.state.employee.isAdmin ? '/admin/reports' : '/welcome')
    }

    if (!router.currentRoute.params.year || !router.currentRoute.params.week) {
      router.replace(format(new Date(), '/yyyy/I'));
    }

    useMeta(() => ({
      title: pageTitle.value,
    }));

    return {
      employee,
      year,
      week,
    };
  },

  head: {},
});
</script>
