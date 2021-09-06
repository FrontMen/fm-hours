<i18n lang="yaml">
  en:
    feedback: "Feedback"
    logout: "Logout"
  nl:
    feedback: "Feedback"
    logout: "Uitloggen"
</i18n>

<template>
  <div class="top-bar hide-print" :class="{'top-bar__development': isDev}">
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

              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdl99lxgE8VDMfHXX_O35Lm8JeJmgA-yDYmG5mMHGWWdT7PrQ/viewform?usp=sf_link"
                target="_blank"
                class="text-white ml-3"
              >
                {{$t("feedback")}}
              </a>
            </div>
          </b-col>

          <b-col v-if="isDev" class="development">
            USING DEVELOPMENT SERVER
          </b-col>

          <b-col class="text-right">
            <LanguageSwitch class="language" />
          </b-col>

          <b-col>
            <div class="employee d-flex align-items-center justify-content-end">
              <div
                v-if="employee"
                class="d-none d-md-block employee__name mr-3"
              >
                {{ employee.name }}
              </div>

              <b-dropdown right class="employee__dropdown">
                <template v-if="employee" #button-content>
                  <b-avatar :src="employee.picture" class="flex-shrink mr-1" />
                </template>

                <b-dropdown-item @click="handleLogoutClick">
                  {{$t("logout")}}
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
import {
  defineComponent,
  PropType,
  useRouter,
  useContext,
} from '@nuxtjs/composition-api';

export default defineComponent({
  emit: ['logout'],
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    employee: {
      type: Object as PropType<Employee>,
    },
    isDev: {
      type: Boolean,
      default: false,
    },
  },
  setup(_, {emit}) {
    const router = useRouter();
    const {localePath} = useContext();

    const handleLogoClick = () => router.push(localePath('/'));
    const handleLogoutClick = () => emit('logout');

    return {
      handleLogoClick,
      handleLogoutClick,
    };
  },
});
</script>

<style lang="scss">
@media print {
  .hide-print {
    visibility: hidden;
  }
}

.top-bar {
  background: var(--color-primary);

  &__development {
    background-color: var(--dark);
  }

  img {
    width: 50px;
    max-height: 100%;
    cursor: pointer;
  }

  .employee__dropdown {
    button {
      padding: 0;
      background-color: transparent !important;
      border: none;
      display: flex;
      align-items: center;
    }
  }

  .employee {
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
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 100%;
      background: white;
      height: 2px;
    }
  }

  .development {
    color: var(--danger);
  }
}
</style>
