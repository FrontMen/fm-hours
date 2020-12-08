<template>
  <div class="page-wrapper">
        <b-container fluid="xl" class="mt-5 customers-table">
            <b-row class="customers-table__inner">
                <b-col class="customer-list">
                    <div>
                        <div class="py-2 px-3 d-flex align-items-center justify-content-between customer-list__head">
                            Customers
                            <b-button v-b-modal.modal-center>
                                + New customer
                            </b-button>
                        </div>
                    </div>

                    <div
                        class="item py-3 px-2"
                        v-for="customer in customers"
                        :key="customer.id"
                    >
                        <div class="font-weight-bold">
                            {{customer.name}}
                        </div>
                        <div>
                            {{customer.debtor}}
                        </div>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    <b-modal
        id="modal-center"
        centered
        title="Add a customer"
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
    computed: {
        ...mapGetters({
            customers: 'customers/getCustomers',
        }),
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

<style lang="scss">

.customers-table {
    background: #efefef;
    height: 100%;
}

.customers-table__inner {
    height: 100%;
}

.customer-list__head {
    background: var(--color-tertiary);
    font-size: 20px;
    color: white;
}

.customer-list {
    box-shadow: 5px 0px 5px -2px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 10;
}

.item {
    border-bottom: 1px solid;

    button {
        background: transparent !important;
        font-size: 17px;

        &:focus,
        &:active {
            box-shadow: none !important;
        }
    }

    &.is-selected {
        background: var(--color-secondary);
    }
}
</style>