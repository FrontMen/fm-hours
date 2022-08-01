<i18n lang="yaml">
en:
  requestLeave: "Request leave"
  feedback: "Feedback"
  logout: "Logout"
nl:
  requestLeave: "Verlof aanvragen"
  feedback: "Feedback"
  logout: "Uitloggen"
</i18n>

<template>
  <div class="top-bar hide-print" :class="{ 'top-bar__development': isDev }">
    <div class="top-bar__inner content-wrapper">
      <b-container class="mx-0 px-0" fluid>
        <b-row class="py-2" align-v="center">
          <b-col>
            <div class="d-flex align-items-center">
              <img src="@/assets/images/logo-black.svg" alt="logo" @click="handleLogoClick" />
              <h1 class="h3 text-muted ml-2 mb-0">Interim hours</h1>
              <div v-if="isAdmin" v-b-toggle.sidebar-1 class="top-bar__hamburger ml-4" />
            </div>
          </b-col>

          <b-col v-if="isDev" class="development">USING DEVELOPMENT SERVER</b-col>

          <b-col>
            <div class="d-flex align-items-center justify-content-end">
              <b-button
                class="mr-2"
                variant="tertiary"
                href="https://bridge.hosted-tools.com/myprofile/absences"
                target="_blank"
                rel="noreferrer"
              >
                {{ $t('requestLeave') }}
                <b-icon icon="box-arrow-up-right" class="ml-1" aria-hidden="true" />
              </b-button>

              <b-dropdown :text="$t('insights')" class="mr-2">
                <b-dropdown-item :to="localePath(`/insights/${employeeId}/${year}/`)">
                  {{ $t("year") }}
                </b-dropdown-item>
                <b-dropdown-item :to="localePath(`/insights/${employeeId}/${year}/${month}`)">
                  {{ $t("month") }}
                </b-dropdown-item>
              </b-dropdown>

              <LanguageSwitch class="mr-2" />

              <b-dropdown right class="employee__dropdown">
                <template v-if="employee" #button-content>
                  {{ employee.name }}
                </template>

                <b-dropdown-item
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdl99lxgE8VDMfHXX_O35Lm8JeJmgA-yDYmG5mMHGWWdT7PrQ/viewform?usp=sf_link"
                  target="_blank"
                >
                  {{ $t("feedback") }}
                  <b-icon class="ml-1" icon="box-arrow-up-right" aria-hidden="true" />
                </b-dropdown-item>
                <b-dropdown-item @click="handleLogoutClick">
                  {{ $t("logout") }}
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
import {computed, defineComponent, PropType, SetupContext, useContext, useRouter} from '@nuxtjs/composition-api';

export default defineComponent({
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    employee: {
      type: Object as PropType<Employee>,
      default: null
    },
    isDev: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['logout'],
  setup(props, {emit}: SetupContext) {
    const router = useRouter();
    const {localePath} = useContext();

    const handleLogoClick = () => router.push(localePath('/'));
    const handleLogoutClick = () => emit('logout');

    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const employeeId = computed(() => props.employee?.id)

    return {
      handleLogoClick,
      handleLogoutClick,
      employeeId,
      year,
      month
    };
  },
});
</script>

<style lang="scss" scoped>
@media print {
  .hide-print {
    visibility: hidden;
  }
}

.top-bar {
  background: var(--color-light-gray);

  img {
    width: 50px;
    max-height: 100%;
    cursor: pointer;
  }

  &__hamburger {
    border-top: 2px solid white;
    border-bottom: 2px solid white;
    border-radius: 0;
    min-width: 30px;
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

  .development {
    color: var(--danger);
  }
}
</style>
