<template>
  <b-sidebar id="sidebar-1" class="pl-2" title="Admin" shadow backdrop>
    <div class="mx-2 mx-md-3">
      <b-button
        v-for="(button, index) in buttons"
        :key="index"
        block
        class="py-2 text-left"
        @click="toPage(button.page)"
      >
        {{ button.label }}
      </b-button>
    </div>
  </b-sidebar>
</template>

<script lang="ts">
import { defineComponent, useRouter } from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const router = useRouter();

    const toPage = (page: string) => {
      router.push(page);
    };

    return {
      toPage,
      buttons: [
        {
          label: "Manage customers",
          page: "/customers",
        },
        {
          label: "Manage users",
          page: "/users",
        },
        {
          label: "Manage holidays",
          page: "/holidays",
        },
        {
          label: "Manage timesheets",
          page: "/timesheets",
        },
      ],
    };
  },
});
</script>
