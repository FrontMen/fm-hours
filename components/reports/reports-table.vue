<i18n lang="yaml">
  en:
    export: "Export"

  nl:
    export: "#required"
</i18n>

<template>
  <div class="reports-table">
    <div class="reports-table__btn mb-4">
      <b-btn @click="exportToCsv">{{$t('export')}}</b-btn>
    </div>

    <b-table
      bordered
      table-variant="light"
      sticky-header="75vh"
      striped
      hover
      small
      responsive
      v-bind="$attrs"
      v-on="$listeners"
    >
      <template #head()="data">
        {{$t(data.column)}}
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@vue/composition-api";

function isNumeric(str: string) {
  if (typeof str !== "string") return false;
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

function convertDecimalToEuropeanStyle(numberText: string) {
  return `"${numberText.replace(/\./g, ',')}"`;
}

export default defineComponent({
  props: {
    csvFileName: {type: String, default: "export"},
  },
  setup(props) {
    const downloadCsv = (csv: any, filename: string) => {
      const csvFile = new Blob(["\uFEFF"+csv], {type: "text/csv; charset=utf-18"});
      const downloadLink = document.createElement("a");

      downloadLink.download = filename;
      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();
    };

    function exportToCsv() {
      const csv: string[] = [];
      const tableRows = document.querySelectorAll("table tr");

      tableRows.forEach((tableRow) => {
        const row: string[] = [];
        const cols = tableRow.querySelectorAll("td, th");

        cols.forEach((col) => {
          let textContent = col.textContent || "";
          textContent = textContent.replaceAll("(Click to sort Ascending)", "");
          textContent = textContent.replaceAll(
            "(Click to sort Descending)",
            ""
          );

          row.push(isNumeric(textContent) ? convertDecimalToEuropeanStyle(textContent) : textContent);
        });

        csv.push(row.join(","));
      });

      downloadCsv(csv.join("\n"), `${props.csvFileName}.csv`);
    }

    return {
      exportToCsv,
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

  td,
  th {
    white-space: nowrap;
  }
}
</style>
