<i18n lang="yaml">
en:
  heading: Contract
  removeContract: "Remove contract"
  close: 'OK'
nl:
  heading: Contract
  removeContract: "Verwijder contract"
  close: 'OK'
</i18n>

<template>
  <b-modal :id="id" ref="modalRef" :title="$t('heading')">
    <contract-modal-content v-if="contract" :contract="contract" />
    <template #modal-footer>
      <div class="contract-modal-footer-wrapper">
        <b-button size="sm" variant="danger" @click="remove">
          <b-icon-trash-fill />
          {{ $t('removeContract') }}
        </b-button>
        <b-button variant="primary" @click="close">{{ $t('close') }}</b-button>
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, SetupContext } from "@nuxtjs/composition-api";
import { BModal } from "bootstrap-vue";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    contract: {
      type: Object as PropType<Contract>,
      default: undefined,
    }
  },
  emits: ['remove'],
  setup(_, {emit}: SetupContext) {
    const modalRef = ref<InstanceType<typeof BModal> | null>(null);

    const close = () => {
      modalRef.value?.hide();
    };

    const remove = () => {
      emit('remove');
      close();
    };

    return {
      modalRef,
      remove,
      close
    }
  }
});
</script>

<style lang="scss" scoped>
.contract-modal-footer-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
