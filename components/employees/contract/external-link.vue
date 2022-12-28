<template>
  <a class="text-body" :href="href" target="_blank">
    <slot />
    <b-icon-box-arrow-up-right />
  </a>
</template>

<script>
export default {
  name: "ExternalLink",
  props: {
    href: {
      type: String,
      required: true,
    },
  }
};
</script>
