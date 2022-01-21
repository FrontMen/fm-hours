<i18n lang="yaml">
en:
  manageProjects: "Manage Projects"
  customerSearchPlaceholder: "Click or search for a customer here"
  addContractModalTitle: "Add contract"
  addContractModalInputPlaceholder: "Search term"
  noContractsFound: "No contracts found by search term"
nl:
  manageProjects: "Projecten bewerkern"
  customerSearchPlaceholder: "Klik of zoek naar een klant"
  addContractModalTitle: "Voeg contract toe"
  addContractModalInputPlaceholder: "Zoek term"
noContractsFound: "Geen contracten gevonden voor de zoek term"
</i18n>

<template>
  <section>
    <h6 class="mb-3">{{ $t('manageProjects') }}</h6>
    <multiselect
      :value="selectedCustomers"
      track-by="id"
      label="label"
      class="mb-3"
      :options="customerOptions"
      :close-on-select="false"
      :multiple="true"
      :taggable="false"
      :placeholder="$t('customerSearchPlaceholder')"
      @input="$emit('update-selected-customers', $event)"
    >
      <template slot="selection" slot-scope="{values}">
        <span v-if="values.length" class="multiselect__single">
          {{ $t('noOptions', {num: values.length}) }}
        </span>
      </template>
    </multiselect>

    <b-table
      :items="selectedCustomers"
      :fields="['name', 'debtor', {key: 'contract', class: 'text-center'}, {key: 'delete', class: 'text-center'}]"
      class="rounded"
      small
      striped
      table-variant="light"
    >
      <template #cell(contract)="row" class="text-center">
        <b-button size="sm" variant="success" v-b-modal.add-contract>
          <b-icon-plus/>
        </b-button>
      </template>
      <template #cell(delete)="row">
        <b-button
          size="sm"
          variant="danger"
          :disabled="row.item.isDefault"
          @click="handleProjectDelete(row.item.id)"
        >
          <b-icon-trash-fill/>
        </b-button>
      </template>
    </b-table>

    <b-modal id="add-contract" scrollable :title="$t('addContractModalTitle')">
      <b-form-input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('addContractModalInputPlaceholder')"
        :trim="true"
        :debounce="300"
        @update="callSearch"
      />
      <b-table
        :items="foundContracts"
        :fields="['name']"
        class="rounded"
        small
        striped
        table-variant="light"
      ></b-table>
    </b-modal>
  </section>
</template>

<script lang="ts">
import {computed, defineComponent, ref, SetupContext, useContext} from "@nuxtjs/composition-api";
import {Canceler} from "axios";

interface ProjectSelectorProps {
  selectedCustomers: Customer[],
  customers: Customer[]
}

export default defineComponent({
  props: {
    selectedCustomers: {
      type: Array,
      required: true,
      default: () => []
    },
    customers: {
      type: Array,
      required: true,
      default: () => []
    },
  },
  emits: ['update-selected-customers'],
  setup(props: ProjectSelectorProps, {emit}: SetupContext) {
    const {app, i18n} = useContext();

    const handleProjectDelete = (projectId: string) => {
      const newList = props.selectedCustomers.filter((customer: Customer) => customer.id !== projectId);

      emit('update-selected-customers', newList);
    }

    const customerOptions = computed(() =>
      props.customers
        .filter((customer) => !customer.isDefault && !customer.archived)
        .map((customer) => ({
          ...customer,
          label: `${customer.name} (${customer.debtor})`,
        }))
    );

    const searchQuery = ref('');
    const foundContracts = ref([]);
    const axiosSource = app.$axios.CancelToken.source();
    let request: { cancel: Canceler } | null;

    const callSearch = async (value: string) => {
      if (request) {
        request.cancel()
      }

      try {
        request = {cancel: axiosSource.cancel}

        const {contractList} = await app.$contractsService.getContractByParam(axiosSource.token, {search: value});

        foundContracts.value = contractList.length > 0 ? contractList : [{name: i18n.t('noContractsFound')}];
      } catch (e) {
        console.error(e);
      } finally {
        request = null;
      }
    }

    return {searchQuery, foundContracts, callSearch, handleProjectDelete, customerOptions}
  },
});
</script>

<style scoped></style>
