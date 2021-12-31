<template>
  <employee-form mode="edit" :employee="employee" />
</template>

<script lang="ts">
import {defineComponent, useAsync, useContext, useRouter} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const {app} = useContext();
    const router = useRouter();

    const employeeId = router.currentRoute.params.id;
    const employee = useAsync(() => app.$employeesService.getEmployee(employeeId));

    return {
      employee
    }
  }
});
</script>
