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
      <b-container fluid class="app-table mb-5">
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
              <b-badge v-if="customer.availableToAll"> Default </b-badge>
            </div>
            <div>
              {{ customer.debtor }}
            </div>
          </b-col>

          <b-col cols-md="4" class="d-flex justify-content-end">
            <b-button @click="deleteCustomer(customer.id)"> Delete </b-button>
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
        placeholder="Debtor (only visible in reports)"
        class="mt-3"
      />
      <b-form-checkbox v-model="newCustomer.isBillable" class="mt-3">
        Billable
      </b-form-checkbox>
      <b-form-checkbox v-model="newCustomer.availableToAll" class="mt-3">
        Available to all employeees
      </b-form-checkbox>
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

  head: {
    title: "Customers",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const customers = computed(() => store.state.customers.customers);
    store.dispatch("customers/getCustomers");

    const newCustomer = ref({
      name: "",
      debtor: "",
      isBillable: true,
      availableToAll: false,
    });

    const canAddCustomer = computed(() => {
      const { name, debtor } = newCustomer.value;
      return name && debtor;
    });

    const addCustomer = () => {
      store.dispatch("customers/addNewCustomer", { ...newCustomer.value });

      newCustomer.value.name = "";
      newCustomer.value.debtor = "";
      newCustomer.value.isBillable = true;
      newCustomer.value.availableToAll = false;
    };

    const deleteCustomer = (id: String) => {
      store.dispatch("customers/deleteCustomer", id);
    };

    return {
      customers,
      newCustomer,
      canAddCustomer,
      addCustomer,
      deleteCustomer,
    };
  },
});
</script>
