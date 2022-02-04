<i18n lang="yaml">
en:
  searchBy: "Search by"
  searchName: "Search for customer name"
  searchDebtor: "Search for debtor name"
  searchPlaceholderName: "Ex.: \"Frontmen\""
  searchPlaceholderDebtor: "Ex.: \"iO\""
  showArchived: "Show archived"
  newCustomer: "New Customer"
  manageCustomer: "Manage Customer"
  addCustomer: "Add a customer"
  default: "Default"
  yes: "Yes"
  no: "No"
  debtorReportOnly: "Debtor (only visible in reports)"
  debtors: "Debtors"
  archived: "Archived"
  actions: "Actions"
nl:
  searchBy: "Zoeken op"
  searchName: "Zoeken op klantnaam"
  searchDebtor: "Zoeken op debiteurennaam"
  searchPlaceholderName: "Bv. \"Frontmen\""
  searchPlaceholderDebtor: "Bv.: \"iO\""
  showArchived: "Laat archief ook zien"
  newCustomer: "Nieuwe klant"
  manageCustomer: "Klant bewerken"
  addCustomer: "Klant toevoegen"
  default: "Standaard"
  yes: "Ja"
  no: "Nee"
  debtorReportOnly: "Debiteur (alleen zichtbaar in rapportage)"
  debtors: "Debiteuren"
  archived: "Gearchiveerd"
  actions: "Acties"
</i18n>

<template>
  <div class="content-wrapper mt-5">
    <b-container class="mx-0 px-0 mb-3" fluid>
      <b-row no-gutters>
        <b-col cols="6" md="3" class="mb-3">
          <label class="employee-status__label" for="status-select">
            {{ $t('searchBy') }}:
          </label>
          <b-form-select
            id="status-select"
            v-model="filterBy"
            :options="filterByOptions"
          />
        </b-col>
        <b-col cols="6" md="4" class="pl-0 mb-3">
          <label class="employee-status__label" for="employee-search">
            {{
              filterBy === 'name' ? $t('searchName') : $t('searchDebtor')




            }}:
          </label>
          <b-input
            id="employee-search"
            v-model="searchTerm"
            type="search"
            :placeholder="filterBy === 'name' ? $t('searchPlaceholderName'): $t('searchPlaceholderDebtor')"
          />
        </b-col>
        <b-col cols="12" md="5" class="ml-auto mt-4">
          <div class="d-flex justify-content-between align-items-center mt-1">
            <b-form-checkbox
              v-model="selectedArchiveOption"
              switch
              class="mr-3 ml-auto"
            >
              {{ $t('showArchived') }}
            </b-form-checkbox>
            <b-button v-b-modal.modal-center>
              {{ $t('newCustomer') }}
            </b-button>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <b-table
      class="mt-3 app-table timesheet-table"
      responsive
      head-variant="dark"
      :items="filteredCustomers"
      :fields="fields"
      :sort-compare="sortCompare"
      :sort-desc.sync="sortDescending"
      :sort-by.sync="sortKey"
      no-sort-reset
    >
      <template #head()="data">
        <div>
          {{ $t(data.label) }}
        </div>
      </template>
      <template #head(archived)="data">
        <div class="text-center">
          {{ $t(data.label) }}
        </div>
      </template>
      <template #head(actions)="data">
        <div class="text-right">
          {{ $t(data.label) }}
        </div>
      </template>

      <template #cell(customers)="scope">
        <strong>{{ scope.item.name }}</strong>
        <b-badge v-if="scope.item.isDefault">{{ $t('default') }}</b-badge>
      </template>
      <template #cell(archived)="scope">
        <div class="text-center">
          <b-badge :variant="scope.item.archived ? 'warning' : 'success'">
            {{ scope.item.archived ? $t('yes') : $t('no') }}
          </b-badge>
        </div>
      </template>
      <template #cell(actions)="scope">
        <div class="text-right">
          <nuxt-link
            :to="localePath(`/admin/customers/${scope.item.id}`)"
            class="btn btn-primary align-self-center"
            :title="$t('manageCustomer')"
          >
            {{ $t('manageCustomer') }}
          </nuxt-link>
        </div>
      </template>
    </b-table>
    <b-modal
      id="modal-center"
      centered
      :title="$t('addCustomer')"
      cancel-variant="danger"
      :ok-disabled="!canAddCustomer"
      :ok-title="$t('ok')"
      :cancel-title="$t('cancel')"
      @ok="addCustomer()"
    >
      <b-form-input
        v-model="newCustomer.name"
        :placeholder="$t('customerName')"
      />
      <b-form-input
        v-model="newCustomer.debtor"
        :placeholder="$t('debtorReportOnly')"
        class="mt-3"
      />
      <b-form-checkbox v-model="newCustomer.isBillable" class="mt-3">
        {{ $t('billable') }}
      </b-form-checkbox>
      <b-form-checkbox v-model="newCustomer.isDefault" class="mt-3">
        {{ $t('availableAll') }}
      </b-form-checkbox>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, useContext, useMeta, useStore,} from "@nuxtjs/composition-api";
import {queryOnString, sortByProp} from "~/helpers/helpers";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const customers = computed(() => store.state.customers.customers);

    useMeta(() => ({
      title: i18n.t('customers') as string,
    }));

    onMounted(() => {
      store.dispatch("customers/getCustomers");
    });

    const filterBy = ref<keyof Customer>('name');
    const filterByOptions: { value: keyof Customer; text: string }[] = [
      {value: "name", text: i18n.t('customerName') as string},
      {value: "debtor", text: i18n.t('debtorName') as string},
    ];
    const searchTerm = ref<string>('');
    const selectedArchiveOption = ref<boolean>(false);
    const sortDescending = ref<boolean>(false);
    const sortKey = ref<string>('');
    const fields = [
      {key: "name", label: "customers", sortable: true},
      {key: "debtor", label: "debtors", sortable: true},
      {key: "archived", label: "archived", sortable: false},
      {key: "actions", label: "actions", sortable: false},
    ];

    const checkCustomerNotArchived = (archived: boolean, customer: Customer) => {
      if (archived) return true;

      return !customer.archived;
    }

    const checkCustomerProp = (query: string, filterByProp: keyof Customer, customer: Customer) => {
      if (!query || !customer) return true;
      if (!customer[filterByProp]) return;

      return queryOnString(customer[filterByProp] as string, query);
    }

    const filteredCustomers = computed(() =>
      customers.value.filter((customer) => (
        checkCustomerNotArchived(selectedArchiveOption.value, customer) &&
        checkCustomerProp(searchTerm.value, filterBy.value, customer)
      )));

    const newCustomer = ref({
      name: "",
      debtor: "",
      isBillable: true,
      isDefault: false,
    });

    const canAddCustomer = computed(() => {
      const {name, debtor} = newCustomer.value;
      return name && debtor;
    });

    const addCustomer = () => {
      store.dispatch("customers/addNewCustomer", {...newCustomer.value});

      newCustomer.value.name = "";
      newCustomer.value.debtor = "";
      newCustomer.value.isBillable = true;
      newCustomer.value.isDefault = false;
    };

    const sortCompare = (a: Customer, b: Customer, key: keyof Customer) => sortByProp<Customer>(a, b, key);

    return {
      fields,
      sortCompare,
      sortDescending,
      sortKey,
      filteredCustomers,
      searchTerm,
      selectedArchiveOption,
      filterBy,
      filterByOptions,
      newCustomer,
      canAddCustomer,
      addCustomer,
    };
  },
  head: {},
});
</script>
