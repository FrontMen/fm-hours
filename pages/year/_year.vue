<template>
  <date-reports
    :start-date="yearStartDate"
    :end-date="yearEndDate"
    is-yearly
    :go-to-previous="goToPreviousYear"
    :go-to-next="goToNextYear"
    :go-to-current="goToCurrentYear"
  />
</template>

<script lang="ts">
import {defineComponent, ref, useContext, useMeta, watch, useRouter} from '@nuxtjs/composition-api';
import {addYears, endOfYear, format, startOfYear, subYears} from 'date-fns';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const router = useRouter();
    const yearParam = router.currentRoute.params.year;

    useMeta(() => ({
      title: `${i18n.t('yearlyReport')} - ${yearParam}` as string,
    }));

    const yearStartDate = ref<Date>(startOfYear(new Date(`${yearParam}`)));
    const yearEndDate = ref<Date>(endOfYear(new Date(`${yearParam}`)));

    watch(
      [yearStartDate],
      () => {
        yearEndDate.value = endOfYear(yearStartDate.value as Date);
      },
      {
        immediate: true,
      }
    );

    const updateRouterPath = (date: Date) => {
      router.replace({
        path: `/year/${format(date, 'yyyy')}`,
      });
    };

    const goToPreviousYear = () => {
      const prevYear = subYears(yearStartDate.value as Date, 1);
      updateRouterPath(prevYear);
    };

    const goToNextYear = () => {
      const nextYear = addYears(yearStartDate.value as Date, 1);
      updateRouterPath(nextYear);
    };

    const goToCurrentYear = () => {
      const currentYear = startOfYear(new Date());
      updateRouterPath(currentYear);
    };

    return {
      goToPreviousYear,
      goToNextYear,
      goToCurrentYear,
      yearStartDate,
      yearEndDate,
    };
  },
  head: {}
});
</script>

<style lang="scss" scoped>
@media screen {
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
