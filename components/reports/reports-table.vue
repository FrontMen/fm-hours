<template>
  <div class="reports-table">
    <div class="reports-table__btn mb-4">
      <b-btn @click="exportToCsv">Export</b-btn>
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
    />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@vue/composition-api";

export default defineComponent({
  props: {
    csvFileName: {type: String, default: "export"},
  },
  setup(props) {
    const downloadCsv = (csv: any, filename: string) => {
      const csvFile = new Blob([csv], {type: "text/csv"});
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

          row.push(textContent);
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
