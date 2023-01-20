<i18n lang="yaml">
en:
  export: "Export"

nl:
  export: "Exporteren"
</i18n>

<template>
  <div class="reports-table">
    <div class="reports-table__btn mb-4">
      <b-btn @click="exportToCsv">{{ $t('export') }}</b-btn>
    </div>

    <b-table
      ref="tableRef"
      bordered
      table-variant="light"
      sticky-header="75vh"
      striped
      hover
      small
      responsive
      :fields="fields"
      :items="items"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <template #head()="data">
        {{ $t(data.column) }}
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "@nuxtjs/composition-api";
import { BTable } from "bootstrap-vue";

function isNumeric(str: string) {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

function convertDecimalToEuropeanStyle(numberText: string) {
  return `"${numberText.replace(/\./g, ',')}"`;
}

export default defineComponent({
  props: {
    csvFileName: {type: String, default: "export"},
    fields: {type: Array, required: true},
    items: {type: Array, required: true},
  },
  setup(props: { csvFileName: string, fields: Array<any>, items: Array<any> }) {
    const tableRef = ref<InstanceType<typeof BTable> | null>(null);

    const downloadCsv = (csv: any, filename: string) => {
      const csvFile = new Blob(["\uFEFF" + csv], {type: "text/csv; charset=utf-18"});
      const downloadLink = document.createElement("a");

      downloadLink.download = filename;
      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();
    };

    function exportToCsv() {
      const csvString = [getCSVHeaders(), getCSVData()].join("\n");
      downloadCsv(csvString, `${props.csvFileName}.csv`);
    }

    function getCSVHeaders() {
      // Use the computed fields because header translations happen in the Bootstrap table
      return tableRef.value?.computedFields.map((field: any) => field.label).join(",");
    }

    function getCSVData() {
      return props.items.map((item: any) => {
        return props.fields.map((field: any) => {
          let val = item[field.key]?.toString() || "";
          if(field.formatter) {
            val = field.formatter(item[field.key]);
          }
          return isNumeric(val) ? convertDecimalToEuropeanStyle(val) : val
        }).join(',');
      }).join("\n")
    }

    return {
      exportToCsv,
      tableRef
    };
  },
});
</script>

<style lang="scss">
.reports-table {
  display: flex;
  flex-direction: column;

  &__btn {
    text-align: right;
  }
}
</style>
