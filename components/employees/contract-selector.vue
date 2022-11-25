<i18n lang="yaml">
en:
  addContractModalTitle: "Add contract"
  addContractModalInputPlaceholder: "Search term"
nl:
  addContractModalTitle: "Voeg contract toe"
  addContractModalInputPlaceholder: "Zoek term"
</i18n>

<template>
  <b-modal
    :id="id"
    size="xl"
    scrollable
    :title="$t('addContractModalTitle')"
    :ok-disabled="selectedContract === undefined"
    v-on="$listeners"
    @ok="submit"
    @cancel="clear"
  >
    <b-form-input
      v-model="searchQuery"
      autofocus
      type="text"
      :placeholder="$t('addContractModalInputPlaceholder')"
      :trim="true"
      :debounce="300"
      @update="search"
    />
    <b-table
      :items="foundContracts"
      :fields="['name', 'project_name', 'project_billingentity_name']"
      class="rounded"
      striped
      table-variant="light"
      selectable
      select-mode="single"
      @row-selected="contractSelected"
    ></b-table>
  </b-modal>
</template>

<script lang="ts">
import {computed, defineComponent, ref, useContext} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  emits: ['selected', 'input'],
  setup(props, {emit}) {
    const {i18n, app} = useContext();

    const showDialog = computed({
      get() {
        return props.value
      },
      set(newValue) {
        emit('input', newValue);
      }
    });

    const searchQuery = ref<string>('');
    const foundContracts = ref<Contract[]>([]);
    const selectedContract = ref<Contract>();

    let axiosAbortController: AbortController;
    const search = async (value: string) => {
      if (axiosAbortController) {
        axiosAbortController.abort();
      }
      axiosAbortController = new AbortController();

      try {
        const {contractList} = await app.$contractsService.getContractByParam(axiosAbortController.signal, {search: value});

        foundContracts.value = contractList.length > 0 ? contractList : [{name: i18n.t('noContractsFound')}];
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error(e);
        }
      }
    }

    const clear = () => {
      foundContracts.value = [];
      searchQuery.value = '';
    }

    const contractSelected = (items: Array<Contract>) => {
      selectedContract.value = items?.[0];
    }

    const submit = () => {
      emit('selected', selectedContract.value);
      clear();
    }

    return {
      showDialog,
      searchQuery,
      search,
      foundContracts,
      contractSelected,
      selectedContract,
      submit,
      clear
    }
  }
});
</script>
