<template>
  <customer-form mode="add" :customer="customer" />
</template>

<script lang="ts">
import {defineComponent, ref} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const customer = ref({
      name: "",
      isBillable: true,
      isDefault: false,
    });

    return {
      customer,
    }
  }
});
</script>
