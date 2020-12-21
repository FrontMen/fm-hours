<template>
  <div>
    <template v-if="lastSavedDate"> Last saved {{ lastSavedLabel }} </template>
  </div>
</template>

<script>
import { formatDistanceToNow } from "date-fns";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      interval: undefined,
      lastSavedLabel: undefined,
    };
  },
  computed: {
    ...mapGetters({
      lastSavedDate: "user/getLastSavedDate",
    }),
  },
  watch: {
    lastSavedDate: {
      immediate: true,
      handler(val) {
        if (val) {
          this.lastSavedLabel = this.updateLastSavedLabel(this.lastSavedDate);
          this.setInterval();
        }
      },
    },
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    setInterval() {
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(() => {
        this.lastSavedLabel = this.updateLastSavedLabel(this.lastSavedDate);
      }, 10000);
    },
    updateLastSavedLabel(date) {
      return formatDistanceToNow(date, { addSuffix: true });
    },
  },
};
</script>
