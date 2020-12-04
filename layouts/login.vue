<template>
  <div class="layout-wrapper"><div>
</div>
    <Nuxt />
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from "vuex";
export default Vue.extend({
    computed: {
        ...mapGetters({
            user: 'user/getUser',
      })
    },
    methods: {
      logout() {
        this.$fire.auth.signOut();
      }
    }
});
</script>

<style lang="scss">

.top-bar {
  background: #201e33;

  img {
    width: 50px;
    max-height: 100%;
  }
}

</style>