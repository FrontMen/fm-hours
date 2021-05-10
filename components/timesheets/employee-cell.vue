<template>
  <div class="wrapper-employee">
    <b-avatar :src="picture" />
    <p>{{ name }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    picture: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.wrapper-employee {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  p {
    margin: 0;
    margin-left: 0.5rem;
  }
}
</style>
