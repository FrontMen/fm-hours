<template>
  <admin-container>
    <team-form mode="edit" :team="team" />
  </admin-container>
</template>

<script lang="ts">
import {defineComponent, useAsync, useContext, useRouter} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const {app} = useContext();
    const router = useRouter();

    const id = router.currentRoute.params.id;
    const team = useAsync(() => app.$teamsService.get(id));

    return {
      team,
    }
  }
});
</script>
