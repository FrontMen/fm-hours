<i18n lang="yaml">
en:
  searchName: "Search for customers"
  searchPlaceholderName: "E.g. iO Digital"
  showArchived: "Show archived"
  newCustomer: "New Customer"
  manageCustomer: "Manage Customer"
  addCustomer: "Add a customer"
  default: "Default"
  yes: "Yes"
  no: "No"
  archived: "Archived"
  actions: "Actions"
nl:
  searchName: "Zoeken op klanten"
  searchPlaceholderName: "Bijv. iO Digital"
  showArchived: "Laat archief ook zien"
  newCustomer: "Nieuwe klant"
  manageCustomer: "Klant bewerken"
  addCustomer: "Klant toevoegen"
  default: "Standaard"
  yes: "Ja"
  no: "Nee"
  archived: "Gearchiveerd"
  actions: "Acties"
</i18n>

<template>
  <div class="content-wrapper mt-5">
    <b-container fluid class="mb-3">
      <b-row class="justify-content-between">
        <b-col cols="6" md="auto" class="pl-0 mb-3">
          <label class="col-form-label employee-status__label text-bold" for="employee-search">
            {{ $t('searchName') }}:
          </label>
          <b-input
            id="employee-search"
            v-model="searchTerm"
            type="search"
            :placeholder="$t('searchPlaceholderName')"
          />
        </b-col>
        <b-col cols="auto">
          <div class="d-flex justify-content-between align-items-center mt-1">
            <b-form-checkbox v-model="selectedArchiveOption" switch class="mr-3 ml-auto">
              {{ $t('showArchived') }}
            </b-form-checkbox>
            <b-button v-b-modal.modal-center variant="primary">
              {{ $t('newCustomer') }}
              <b-icon icon="person" />
            </b-button>
          </div>
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid class="mb-3">
      <b-table
        class="row mt-3 app-table timesheet-table"
        responsive
        striped
        hover
        small
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
        <template #head(isDefault)="data">
          <div class="text-center">
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
        <template #cell(isDefault)="scope">
          <div class="text-center">
            <b-badge :variant="scope.item.isDefault ? 'warning' : 'info'">
              {{ scope.item.isDefault ? $t('yes') : $t('no') }}
            </b-badge>
          </div>
        </template>
        <template #cell(archived)="scope">
          <div class="text-center">
            <b-badge :variant="scope.item.archived ? 'warning' : 'info'">
              {{ scope.item.archived ? $t('yes') : $t('no') }}
            </b-badge>
          </div>
        </template>
        <template #cell(actions)="scope">
          <div class="text-right">
            <nuxt-link
              :to="localePath(`/admin/customers/${scope.item.id}`)"
              class="btn btn-sm btn-primary align-self-center"
              :title="$t('manageCustomer')"
            >
              <b-icon icon="pencil-fill" />
            </nuxt-link>
          </div>
        </template>
      </b-table>
    </b-container>

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
      <b-form-input v-model="newCustomer.name" :placeholder="$t('customerName')" />
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

    const searchTerm = ref<string>('');
    const selectedArchiveOption = ref<boolean>(false);
    const sortDescending = ref<boolean>(false);
    const sortKey = ref<string>('');
    const fields = [
      {key: "name", label: "customers", sortable: true},
      {key: "archived", label: "archived", sortable: false},
      {key: "isDefault", label: "default", sortable: false},
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
        checkCustomerProp(searchTerm.value, 'name', customer)
      )));

    const newCustomer = ref({
      name: "",
      isBillable: true,
      isDefault: false,
    });

    const canAddCustomer = computed(() => {
      return !!newCustomer.value.name;
    });

    const addCustomer = () => {
      store.dispatch("customers/addNewCustomer", {...newCustomer.value});

      newCustomer.value.name = "";
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
      newCustomer,
      canAddCustomer,
      addCustomer,
    };
  },
  head: {},
});
</script>
