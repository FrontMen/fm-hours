<template>
  <b-sidebar id="sidebar-1" shadow backdrop>
    <b-list-group>
      <b-list-group-item href="/">
        <b-icon icon="house" /> Home
      </b-list-group-item>
      <b-list-group-item href="/customers">
        <b-icon icon="building" /> Customers
      </b-list-group-item>
      <b-list-group-item href="/employees">
        <b-icon icon="people" /> Employees
      </b-list-group-item>
      <b-list-group-item href="/holidays">
        <b-icon icon="sun" /> Holidays
      </b-list-group-item>
      <b-list-group-item href="/timesheets">
        <b-icon icon="calendar" /> Timesheets
      </b-list-group-item>
      <b-list-group-item href="/reports">
        <b-icon icon="file-bar-graph" /> Reports
      </b-list-group-item>
    </b-list-group>
  </b-sidebar>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({});
</script>
