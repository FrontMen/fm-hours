<i18n lang="yaml">
en:
  home: "Home"
  customers: "Customers"
  employees: "Employees"
  holidays: "Holidays"
  timesheets: "Timesheets"
  reports: "Reports"
nl:
  home: "Overzicht"
  customers: "Klanten"
  employees: "Medewerkers"
  holidays: "Feestdagen"
  timesheets: "Timesheets"
  reports: "Rapportages"
</i18n>


<template>
  <b-sidebar id="sidebar-1" shadow backdrop>
    <b-list-group>
      <!-- <b-list-group-item
        :v-for="option in navigationOptions"
        :href="localePath('/')"
      >
        <b-icon icon="option.icon" /> {{ $t(option.name) }}
      </b-list-group-item> -->
      <b-list-group-item :href="localePath('customers')">
        <b-icon icon="building" /> {{ $t("customers") }}
      </b-list-group-item>
      <b-list-group-item :href="localePath('/employees')">
        <b-icon icon="people" /> {{ $t("employees") }}
      </b-list-group-item>
      <b-list-group-item :href="localePath('holidays')">
        <b-icon icon="sun" /> {{ $t("holidays") }}
      </b-list-group-item>
      <b-list-group-item :href="localePath('timesheets')">
        <b-icon icon="calendar" /> {{ $t("timesheets") }}
      </b-list-group-item>
      <b-list-group-item :href="localePath('reports')">
        <b-icon icon="file-bar-graph" /> {{ $t("reports") }}
      </b-list-group-item>
    </b-list-group>
  </b-sidebar>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const navigationOptions = [{ name: "home", icon: "house" }];
    return { navigationOptions };
  },
});
</script>
