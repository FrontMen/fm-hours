<template>
  <div class="top-bar">
    <div class="top-bar__inner content-wrapper">
      <b-container class="mx-0 px-0" fluid>
        <b-row class="py-2" align-v="center">
          <b-col>
            <div class="d-flex align-items-center">
              <img
                src="@/assets/images/logo-dark.png"
                alt="frontmen logo"
                @click="handleLogoClick"
              />

              <div
                v-if="isAdmin"
                v-b-toggle.sidebar-1
                class="top-bar__hamburger ml-4"
              />
            </div>
          </b-col>

          <b-col>
            <div class="user d-flex align-items-center justify-content-end">
              <div class="d-none d-md-block user__name mr-3">
                {{ user.name }}
              </div>

              <b-dropdown right class="user__dropdown">
                <template #button-content>
                  <b-avatar :src="user.picture" class="flex-shrink mr-1" />
                </template>

                <b-dropdown-item @click="handleLogoutClick">
                  Logout
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, useRouter } from "@nuxtjs/composition-api";

export default defineComponent({
  emit: ["logout"],
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
  setup(_, { emit }) {
    const router = useRouter();

    const handleLogoClick = () => router.push("/records");
    const handleLogoutClick = () => emit("logout");

    return {
      handleLogoClick,
      handleLogoutClick,
    };
  },
});
</script>

<style lang="scss">
.top-bar {
  background: var(--color-primary);

  img {
    width: 50px;
    max-height: 100%;
    cursor: pointer;
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
  }

  &__hamburger {
    border-top: 2px solid white;
    border-bottom: 2px solid white;
    border-radius: 0;
    width: 30px;
    height: 20px;
    background: transparent !important;
    position: relative;

    &:focus {
      outline: none;
    }

    &:before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 100%;
      background: white;
      height: 2px;
    }
  }
}
</style>
