<template>
  <b-button-group>
    <b-button @click="toPrevMonth">
      <b-icon icon="arrow-left" />
    </b-button>

    <b-button class="current-month" :disabled="isCurrentMonth" @click="toCurrMonth">
      {{ selectedMonthLabel }}
    </b-button>

    <b-button @click="toNextMonth">
      <b-icon icon="arrow-right" />
    </b-button>
  </b-button-group>
</template>

<script lang="ts">
import {computed, defineComponent, SetupContext, useContext} from "@nuxtjs/composition-api";
import {addMonths, isThisMonth, startOfMonth} from "date-fns";

export default defineComponent({
  props: {
    value: {
      type: Date,
      default: new Date()
    }
  },
  emits: ['input'],
  setup(props: { value: Date }, {emit}: SetupContext) {
    const {i18n} = useContext();

    const selectedMonthLabel = computed(() => i18n.d(props.value, 'monthYear'));
    const isCurrentMonth = computed(() => isThisMonth((props.value)));

    const toPrevMonth = () => {
      emit('input', addMonths(props.value, -1));
    };
    const toCurrMonth = () => {
      emit('input', startOfMonth(new Date()));
    };
    const toNextMonth = () => {
      emit('input', addMonths(props.value, 1));
    };

    return {
      selectedMonthLabel,
      isCurrentMonth,
      toPrevMonth,
      toCurrMonth,
      toNextMonth
    }

  }
});
</script>

<style scoped>
.current-month {
  width: 150px;
}
</style>
