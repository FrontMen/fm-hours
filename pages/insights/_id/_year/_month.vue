<i18n lang="yaml">
en:
  insights: "Insights"
nl:
  insights: "Inzichten"
</i18n>

<template>
  <date-reports
    :start-date="startDate"
    :end-date="endDate"
    :is-yearly="isYearly"
    :go-to-previous="goToPrevious"
    :go-to-next="goToNext"
    :go-to-current="goToCurrent"
    :employee-id="id"
  />
</template>

<script lang="ts">
import {defineComponent, ref, useContext, useMeta, watch, useRouter} from '@nuxtjs/composition-api';
import {
  addMonths,
  addYears,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears
} from 'date-fns';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const router = useRouter();

    const {id, year, month} = router.currentRoute.params;
    const isYearly = month === undefined;

    const d = new Date(`${month || 1}/1/${year}`);
    const startDate = ref<Date>(isYearly ? startOfYear(d) : startOfMonth(d));
    const endDate = ref<Date>(isYearly ? endOfYear(d) : endOfMonth(d));

    useMeta(() => {
      const period = isYearly ?
        startDate.value.getFullYear() :
        i18n.d(startDate.value as Date, 'monthYear');

      return ({
        title: `${i18n.t('insights')} - ${period}` as string,
      });
    });


    watch(
      [startDate],
      () => {
        endDate.value = isYearly ?
          endOfYear(startDate.value as Date) :
          endOfMonth(startDate.value as Date);
      },
      {
        immediate: true,
      }
    );

    const goToYear = (date: Date) => {
      router.replace({
        path: `/insights/${id}/${format(date, 'yyyy')}`,
      });
    };

    const goToMonth = (date: Date) => {
      router.replace({
        path: `/insights/${id}/${format(date, 'yyyy')}/${format(date, 'M')}`,
      });
    };

    const goToPrevious = () => {
      isYearly ?
        goToYear(subYears(startDate.value as Date, 1)) :
        goToMonth(subMonths(startDate.value as Date, 1));
    };

    const goToNext = () => {
      isYearly ?
        goToYear(addYears(startDate.value as Date, 1)) :
        goToMonth(addMonths(startDate.value as Date, 1));
    };

    const goToCurrent = () => {
      isYearly ?
        goToYear(startOfYear(new Date())) :
        goToMonth(startOfMonth(new Date()));
    };

    return {
      goToPrevious,
      goToNext,
      goToCurrent,
      startDate,
      endDate,
      id,
      isYearly
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
