<i18n lang="yaml">
  en:
    en: "English"
    nl: "Nederlands"
  nl:
    en: "English"
    nl: "Nederlands"
</i18n>

<template>
  <div class="d-inline-block language-switcher">
    <b-dropdown>
      <template #button-content>
        <img class="mr-2" :src="svgUrl" :alt="$t(`lang.${activeLocaleCode}`)" />
      </template>
      <b-dropdown-item
        v-for="locale in availableLocalesToSelect"
        :key="locale.code"
      >
        <nuxt-link
          :key="locale.code"
          :to="switchLocalePath(locale.code)"
          :class="{ active: locale.isActiveLocale }"
        >
          <img
            :src="getLanguageSvgUrl(locale.code)"
            :alt="$t(`lang.${locale.code}`)"
          />
          {{ $t(`lang.${locale.code}`) }}
        </nuxt-link>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, useContext} from '@nuxtjs/composition-api';
import type {LocaleObject} from 'nuxt-i18n';
export default defineComponent({
  setup() {
    const {i18n} = useContext();

    const availableLocales = computed(() =>
      (i18n.locales as LocaleObject[]).map((loc) => {
        return {
          code: loc.code,
          isActiveLocale: loc.code === i18n.locale,
        };
      })
    );

    const activeLocaleCode = computed(
      () => availableLocales.value.find((loc) => loc.isActiveLocale)?.code
    );

    const availableLocalesToSelect = computed(() =>
      availableLocales.value.filter((locale) => !locale.isActiveLocale)
    );

    const svgUrl = computed(() => {
      return getLanguageSvgUrl(activeLocaleCode.value!);
    });

    return {
      availableLocalesToSelect,
      svgUrl,
      activeLocaleCode,
      getLanguageSvgUrl,
    };

    /**
     * Since the ~/assets is evaluated via webpack, we have to require
     * the asset URL to get it properly.
     * https://nuxtjs.org/docs/2.x/directory-structure/assets#images
     */
    function getLanguageSvgUrl(code: string) {
      return require(`~/assets/languages/${code}.svg`);
    }
  },
});
</script>


<style lang="scss">
.language-switcher {
  a {
    text-decoration: none;
  }

  img {
    width: 20px;
    cursor: default;
  }
}
</style>
