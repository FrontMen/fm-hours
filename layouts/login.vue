<template>
  <div class="layout-wrapper">
    <div />
    <Nuxt />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useStore, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    // FIXME: would be nice it can access user store directly
    const store = useStore<RootStoreState>();
    // @ts-ignore FIXME: user state is not defined yet
    const user = computed(() => store.user.user);

    const logout = () => {
      useContext().$fire.auth.signOut()
    }

    return {
      user,
      logout,
    }
  }
})
</script>

<style lang="scss">
.top-bar {
  img {
    width: 50px;
    max-height: 100%;
  }
}
</style>
