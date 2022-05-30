<i18n lang="yaml">
  en:
    home: "Home"
    customers: "Customers"
    employees: "Employees"
    holidays: "Holidays"
    timesheets: "Timesheets"
    reports: "Reports"
    insights: "Insights"
  nl:
    home: "Overzicht"
    customers: "Klanten"
    employees: "Medewerkers"
    holidays: "Feestdagen"
    timesheets: "Timesheets"
    reports: "Rapportages"
    insights: "Inzichten"
</i18n>

<template>
  <b-sidebar id="sidebar-1" shadow backdrop>
    <b-list-group>
      <b-list-group-item v-for="(link, index) in links" :key="index" :to="localePath(link.href)">
        <b-icon :icon="link.icon" />
        {{ $t(link.name) }}
      </b-list-group-item>
    </b-list-group>
  </b-sidebar>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const links = [
      {
        href: "/",
        name: "home",
        icon: "house",
      },
      {
        href: "/admin/customers",
        name: "customers",
        icon: "building",
      },
      {
        href: "/admin/employees",
        name: "employees",
        icon: "people",
      },
      {
        href: "/admin/timesheets",
        name: "timesheets",
        icon: "calendar",
      },
      {
        href: "/admin/reports",
        name: "reports",
        icon: "file-bar-graph",
      },
      {
        href: "/admin/insights",
        name: "insights",
        icon: "file-bar-graph",
      },
    ];
    return {links};
  },
});
</script>
