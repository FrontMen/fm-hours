<i18n lang="yaml">
en:
  home: "Home"
  customers: "Customers"
  employees: "Employees"
  teams: "Teams"
  holidays: "Holidays"
  timesheets: "Timesheets"
  reports: "Reports"
nl:
  home: "Overzicht"
  customers: "Klanten"
  employees: "Medewerkers"
  teams: "Teams"
  holidays: "Feestdagen"
  timesheets: "Timesheets"
  reports: "Rapportages"
</i18n>

<template>
  <div class="admin-sidebar min-vh-100">
    <ul
      class="nav nav-pills nav-flush flex-column mb-auto text-center bg-dark h-100 position-fixed"
    >
      <li v-for="(link, index) in links" :key="index" :to="localePath(link.href)">
        <a
          v-b-tooltip.hover.right="{ variant: 'secondary' }"
          :href="link.href"
          class="nav-link active py-3 px-4"
          :title="$tc(link.name)"
        >
          <b-icon :icon="link.icon" />
        </a>
      </li>
    </ul>
  </div>
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
        icon: "person",
      },
      {
        href: "/admin/teams",
        name: "teams",
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
    ];
    return {links};
  },
});
</script>

<style lang="scss" scoped>
.admin-sidebar {
  width: 68px; // width of menu items
}
</style>
