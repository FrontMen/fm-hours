<template>
  <b-button-group>
    <b-form-select
      :value="year"
      :options="availableYearsList"
      class="year-selector mb-2"
      @input="changeYear"
    ></b-form-select>
  </b-button-group>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "@nuxtjs/composition-api";
import {getYear, sub, eachYearOfInterval} from "date-fns";

export default defineComponent({
  props: {
    value: {
      type: Date,
      default: () => new Date(),
    }
  },
  emits: ['input'],
  setup(props: { value: Date }) {
    const year = ref(getYear(props.value));

    const availableYearsList = computed(() => {
      const currentDate = props.value;
      const startYear = sub(currentDate, {
        years: 5,
      });

      console.table({ currentDate, startYear })
      return eachYearOfInterval({ start: startYear, end: currentDate }).map((date) => getYear(date));
    });

    const changeYear = (year: string) => {
      // Format year to full date and emit
      console.log(year);
    };

    return {
      year,
      availableYearsList,
      changeYear,
      getYear,
    }

  }
});
</script>

<style scoped>
.year-selector {
  width: 150px;
}
</style>
