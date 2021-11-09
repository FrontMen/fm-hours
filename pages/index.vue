<template>
  <p></p>
</template>

<script lang="ts">
import {defineComponent, useRouter} from "@nuxtjs/composition-api";
import {format} from "date-fns";

export default defineComponent({
  setup() {
    const router = useRouter();
    router.replace(format(new Date(), '/yyyy/I'));
  }
});
</script>
