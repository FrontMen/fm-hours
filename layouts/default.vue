<template>
  <div class="layout-wrapper">
    <div class="top-bar">
      <b-container>
        <b-row class="py-2" align-v="center">
          <b-col>
            <div class="d-flex align-items-center">
              <img @click="toPage('/hours')" src="@/assets/images/logo-dark.png" alt="frontmen logo">
              <b-button
                v-if="isAdmin"
                @click="toPage('/customers')"
                class="ml-2 ml-md-3 py-1 manage-customers-button"
              >
                Manage customers
              </b-button>
            </div>
          </b-col>
          <b-col cols="4">
              <div class="user d-flex align-items-center justify-content-end">
                <div class="d-none d-md-block user__name mr-3">
                  {{user.name}}
                </div>
                  <b-dropdown right class="user__dropdown">
                      <template #button-content>
                        <div class="user__image flex-shrink-0 mr-1">
                          <img :src="user.picture" alt="user image">
                        </div>
                      </template>
                  <b-dropdown-item @click="logout()">Logout</b-dropdown-item>
                </b-dropdown>
              </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <div>
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
            isAdmin: 'user/isUserAdmin'
      })
    },
    methods: {
      logout() {
        this.$store.dispatch('user/logout');
      },
      toPage(page) {
        this.$router.push(page);
      }
    }
});
</script>

<style lang="scss">
.manage-customers-button {
    background: transparent !important;
    border: none;
    border-radius: 0;

    &:hover {
      border-bottom: 1px solid white;
    }
}

@media screen and (max-width: 767px) {
      .manage-customers-button {
        font-size: 15px;
      }
  }

.top-bar {
  background: var(--color-primary);

  img {
    width: 50px;
    max-height: 100%;
  }

  .user__dropdown {
      button {
      padding: 0;
      background-color: transparent !important;
      border: none;
      display: flex;
      align-items: center;
    }
  }

  .user {
    color: white;
    &__image {
      width: 45px;
      height: 45px;
      border-radius: 100%;
      background: white;
      overflow: hidden;
    }
  }
}

</style>