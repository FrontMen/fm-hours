<template>
  <div class="mt-5 content-wrapper">
    <weekly-timesheet
      v-if="employee"
      :employee="employee"
      :year="year"
      :week="week"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
  useRouter,
  useStore,
} from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const employee = computed(() => store.state.employee.employee);
    const year = computed(() => parseInt(router.currentRoute.params.year, 10));
    const week = computed(() => parseInt(router.currentRoute.params.week, 10));
    const pageTitle = computed(() =>`${i18n.t('timesheets')} - ${employee.value?.name}`);

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
