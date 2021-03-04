<template>
  <div>
    <template v-if="lastSavedDate">
      Last saved {{ lastSavedLabel }}
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  useStore,
  watch,
} from "@nuxtjs/composition-api";
import { formatDistanceToNow } from "date-fns";

export default defineComponent({
  setup() {
    // FIXME: would be nice it can access holidays store directly
    const store = useStore<RootStoreState>();
    // @ts-ignore FIXME: user state is not defined yet
    const lastSavedDate = computed(() => store.state.user.lastSaved);
    const lastSavedLabel = ref('')

    const updateLastSavedLabel = () => {
      lastSavedLabel.value =  formatDistanceToNow(lastSavedDate.value || 0);
    };

    let intervalHandle: NodeJS.Timeout;
    const setIntervalHandle = () => {
      intervalHandle = setInterval(updateLastSavedLabel, 1000);
    };

    watch(lastSavedDate, setIntervalHandle, { immediate: true });
    onBeforeUnmount(() => clearInterval(intervalHandle));

    return {
      lastSavedDate,
      lastSavedLabel,
    };
  },
});
</script>
