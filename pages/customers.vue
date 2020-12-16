<template>
  <div class="page-wrapper">
      <div class="content-wrapper mt-5">
        <b-container class="mx-0 px-0 mb-3" fluid>
            <b-row :no-gutters="true">
                <b-col>
                    <div class="d-flex justify-content-end">
                        <b-button v-b-modal.modal-center>
                            + New customer
                        </b-button>
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
                class="app-table__row py-3"
                v-for="customer in customers"
                :key="customer.id"
            >
                <b-col>
                    <div class="font-weight-bold">
                        {{customer.name}}
                    </div>
                    <div>
                        {{customer.debtor}}
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
        <b-form-input v-model="newCustomer.name" placeholder="Customer name"></b-form-input>
        <b-form-input v-model="newCustomer.debtor" placeholder="Debtor of Customer" class="mt-3"></b-form-input>
    </b-modal>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from "vuex";
import { format, formatISO } from "date-fns";

export default Vue.extend({
    middleware: 'isAdmin',
    computed: {
        ...mapGetters({
            customers: 'customers/getCustomers',
        }),
        canAddCustomer: function() {
            return this.newCustomer['name'] && this.newCustomer['debtor']
        }
    },
    data() {
        return {
            newCustomer: {
                name: '',
                debtor: ''
            }
        }
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    methods: {
        addCustomer() {
            this.$store.dispatch('customers/addNewCustomer', {...this.newCustomer});
            this.newCustomer.name = '';
            this.newCustomer.debtor = '';
        },
    }
})
</script>