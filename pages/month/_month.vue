<template>
  <date-reports
    :start-date="monthStartDate"
    :end-date="monthEndDate"
    :go-to-previous="goToPreviousMonth"
    :go-to-next="goToNextMonth"
    :go-to-current="goToCurrentMonth"
  />
</template>

<script lang="ts">
import {defineComponent, ref, useContext, useMeta, watch,useRouter} from '@nuxtjs/composition-api';
import {addMonths, endOfMonth, format, startOfMonth, subMonths} from 'date-fns';
import { getMonthName } from '~/helpers/helpers';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const router = useRouter();

    const monthParam = router.currentRoute.params.month;
    const selectedMonthNumber = +monthParam -1;

    useMeta(() => ({
      title: `${i18n.t('monthlyReport')} - ${getMonthName(selectedMonthNumber)}` as string,
    }));

    const currentYear = new Date().getFullYear();
    const selectedMonthWithCurrentYear = new Date(currentYear, selectedMonthNumber);
    const monthStartDate = ref<Date>(startOfMonth(selectedMonthWithCurrentYear));
    const monthEndDate = ref<Date>(endOfMonth(selectedMonthWithCurrentYear));

    watch(
      [monthStartDate],
      () => {
        monthEndDate.value = endOfMonth(monthStartDate.value as Date);
      },
      {
        immediate: true,
      }
    );

    const updateRouterPath = (date: Date) => {
      router.replace({
        path: `/month/${format(date, 'MM')}`,
      });
    };

    const goToPreviousMonth = () => {
      monthStartDate.value = subMonths(monthStartDate.value as Date, 1);
      updateRouterPath(monthStartDate.value as Date);
    };

    const goToNextMonth = () => {
      monthStartDate.value = addMonths(monthStartDate.value as Date, 1);
      updateRouterPath(monthStartDate.value as Date);
    };

    const goToCurrentMonth = () => {
      monthStartDate.value = startOfMonth(new Date());
      updateRouterPath(monthStartDate.value as Date);
    };

    const triggerPrint = () => {
      window.print();
    };

    return {
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
      monthStartDate,
      monthEndDate,
      triggerPrint,
    };
  },
  head: {},
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
