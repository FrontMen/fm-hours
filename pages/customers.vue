<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container class="mx-0 px-0 mb-3" fluid>
        <b-row :no-gutters="true">
          <b-col>
            <div class="d-flex justify-content-end">
              <b-button v-b-modal.modal-center> + New customer </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>
      <b-container fluid class="app-table">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Customers</span>
          </b-col>
        </b-row>
        <b-row
          v-for="customer in customers"
          :key="customer.id"
          class="app-table__row py-3"
        >
          <b-col>
            <div class="font-weight-bold">
              {{ customer.name }}
            </div>
            <div>
              {{ customer.debtor }}
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <b-modal
      id="modal-center"
      centered
      title="Add a customer"
      cancel-variant="danger"
      :ok-disabled="!canAddCustomer"
      @ok="addCustomer()"
    >
      <b-form-input v-model="newCustomer.name" placeholder="Customer name" />
      <b-form-input
        v-model="newCustomer.debtor"
        placeholder="Debtor of Customer"
        class="mt-3"
      />
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const store = useStore<RootStoreState>();
    const customers = computed(() => store.state.customers.customers);
    store.dispatch("customers/getCustomers");

    const newCustomer = ref({
      name: "",
      debtor: "",
    });

    const canAddCustomer = computed(() => {
      const { name, debtor } = newCustomer.value;
      return name && debtor;
    });

    const addCustomer = () => {
      store.dispatch("customers/addNewCustomer", {
        ...newCustomer.value,
      });

      newCustomer.value.name = "";
      newCustomer.value.debtor = "";
    };

    return {
      customers,
      newCustomer,
      canAddCustomer,
      addCustomer,
    };
  },
});
</script>
