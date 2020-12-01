<template>
  <div class="page-wrapper">
    <div class="hours-table">
        <b-container fluid="lg">
            <b-row class="hours-table__top-row text-center">
                <b-col></b-col>
                <b-col>
                    <b-container class="p-0 d-none d-md-block">
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
            <b-row
                v-for="customer in customers"
                :key="customer.id"
            >
                <div>{{customer.name}}</div>
                <b-button v-b-toggle.collapse-1 variant="primary">Toggle Collapse</b-button>
                    <b-collapse id="collapse-1" class="mt-2">
                        <b-card>
                            <p class="card-text">Collapse contents Here</p>
                        </b-card>
                </b-collapse>
            </b-row>

            <b-row>
                <b-col>
                    <b-button v-b-modal.modal-center>
                        + New customer
                    </b-button>
                </b-col>
                <b-col>
                    <b-container>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
        </b-container>
    </div>
    <b-modal
        id="modal-center"
        centered
        title="BootstrapVue"
        @ok="addCustomer()"
    >
        <p class="my-4">Select a customer</p>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from "vuex";
import { format, formatISO } from "date-fns";

export default Vue.extend({
    computed: {
        ...mapGetters({
            customers: 'customers/getCustomers',
        }),
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    methods: {
        addCustomer() {
            const customer = {
                name: 'test customer'
            }
            this.$store.dispatch('customers/addNewCustomer', customer);
        }
    }
})
</script>

<style lang="scss">
.date {
    font-size: 12px;
}
.hours-table {
    &__date {
        font-size: 24px;
        padding: 18px 0px;
        display: flex;
        align-items: center;
    }

    &__top-row {
        background: #ccc;
        height: 50px;
    }
}
</style>