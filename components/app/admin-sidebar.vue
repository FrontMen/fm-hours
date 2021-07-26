<template>
  <b-sidebar id="sidebar-1" shadow backdrop>
    <b-list-group>
      <b-list-group-item
        v-for="(link, index) in links"
        :key="index"
        :to="link.href"
      >
        <b-icon :icon="link.icon" />
        {{ link.name }}
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
        name: "Home",
        icon: "house",
      },
      {
        href: "/customers",
        name: "Customers",
        icon: "building",
      },
      {
        href: "/employees",
        name: "Employees",
        icon: "people",
      },
      {
        href: "/holidays",
        name: "Holidays",
        icon: "sun",
      },
      {
        href: "/timesheets",
        name: "Timesheets",
        icon: "calendar",
      },
      {
        href: "/reports",
        name: "Reports",
        icon: "file-bar-graph",
      },
    ];
    return {links};
  },
});
</script>
