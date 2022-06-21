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
import {defineComponent, ref, useContext, useMeta, watch} from '@nuxtjs/composition-api';
import {addMonths, endOfMonth, startOfMonth, subMonths} from 'date-fns';

export default defineComponent({
  setup() {
    const {i18n} = useContext();

    const date = new Date();

    const monthStartDate = ref<Date>(startOfMonth(date));
    const monthEndDate = ref<Date>(endOfMonth(date));

    useMeta(() => ({
      title: `${i18n.t('monthlyReport')} - ${i18n.d(monthStartDate.value, 'month')}` as string,
    }));

    watch(
      [monthStartDate],
      () => {
        monthEndDate.value = endOfMonth(monthStartDate.value as Date);
      },
      {
        immediate: true,
      }
    );

    const goToPreviousMonth = () => {
      monthStartDate.value = subMonths(monthStartDate.value as Date, 1);
    };

    const goToNextMonth = () => {
      monthStartDate.value = addMonths(monthStartDate.value as Date, 1);
    };

    const goToCurrentMonth = () => {
      monthStartDate.value = startOfMonth(new Date());
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
