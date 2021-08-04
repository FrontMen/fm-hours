<template>
  <div class="comment-block border rounded border-secondary mt-4">
    <div v-if="!!formatedDate" class="comment-block__header">
      {{`Sent at ${formatedDate}`}}
    </div>
    <p class="comment-block__text">
      {{text}}
    </p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed
} from "@nuxtjs/composition-api";
import {format} from "date-fns";

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    date: {
      type: Number,
      required: false
    }
  },
  setup(props) {
    const formatDate = (timestamp: number) => format(timestamp, "dd/MM/yyyy HH:mm");

    const formatedDate = computed(() => props.date ? formatDate(props.date) : '')

    return {
      formatedDate
    }
  },
})
</script>

<style lang="scss" scoped>
.comment-block {
 position: relative;
 overflow: hidden;

 &__header {
   position: relative;
   left: 0;
   top: 0;
   width: 100%;

   font-size: 12px;
   background-color: #bbb;

   padding: 0.3rem 1rem;
 }

 &__text {
   margin: 1rem;
 }
}
</style>
