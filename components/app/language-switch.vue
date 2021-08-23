<i18n lang="yaml">
  en:
    en: "English"
    nl: "Nederlands"
  nl:
    en: "English"
    nl: "Nederlands"
</i18n>

<style lang="scss">
.language-switcher {
  img {
    width: 20px;
    cursor: default;
  }
}
</style>

<template>
  <div class="d-inline-block language-switcher">
    <img
      :src="`/_nuxt/assets/languages/${availableLocales.find(locale => locale.isActiveLocale).code}.svg`"
      :alt="$t(`lang.${availableLocales.find(locale => locale.isActiveLocale).code}`)"
    />
    <b-dropdown>
      <b-dropdown-item
        v-for="locale in availableLocales.filter(locale => !locale.isActiveLocale)"
        :key="locale.code"
      >
        <nuxt-link
          :key="locale.code"
          :to="switchLocalePath(locale.code)"
          :class="{ active: locale.isActiveLocale }"
        >
          <img
            :src="`/_nuxt/assets/languages/${locale.code}.svg`"
            alt="lang.${locale.code}"
          />
          {{ $t(`lang.${locale.code}`) }}
        </nuxt-link>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from "@nuxtjs/composition-api";
// eslint-disable-next-line import/named
import { LocaleObject } from "nuxt-i18n";
export default defineComponent({
  setup() {
    const { i18n } = useContext();
    const availableLocales = computed(() =>
      (i18n.locales as LocaleObject[]).map((loc: LocaleObject) => {
        return {
          code: loc.code,
          isActiveLocale: loc.code === i18n.locale,
        };
      })
    );
    return {
      availableLocales,
    };
  },
});
</script>
