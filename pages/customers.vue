<template>
  <div class="page-wrapper">
        <b-container fluid="xl" class="customers-table">
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
                        class="py-3 px-2 item"
                        v-for="customer in customers"
                        :key="customer.id"
                        :class="{ 'is-selected': customer.id === activeCustomerId }"
                    >
                        <b-button
                            block
                            class="p-0 rounded-0 border-0 text-left d-flex justify-content-between align-items-center bg-white text-dark"
                            @click="getProjectForCustomer(customer.id)"
                        >
                            {{customer.name}}
                            <b-icon icon="arrow-right"></b-icon>
                        </b-button>
                    </div>
                </b-col>
                <b-col>
                    <div>
                        <div class="py-2 px-3 d-flex align-items-center justify-content-between customer-list__head">
                            Projects
                            <b-button v-if="!noCustomerSelected" v-b-modal.project-modal>
                                + New project
                            </b-button>
                        </div>
                    </div>
                    <template v-if="projectsByCustomer">
                        <template v-if="projectsByCustomer.length > 0">
                            <div
                                class="item py-3"
                                v-for="project in projectsByCustomer"
                                :key="project.id"
                            >
                                {{project.name}}
                            </div>
                        </template>
                        <template v-else>
                        <div class="p-5 text-center">
                            This customer has no projects yet
                        </div>
                        </template>
                    </template>
                    <template v-else>
                        <div class="p-5 text-center">
                            Select a customer to see the projects
                        </div>
                    </template>
                </b-col>
            </b-row>
        </b-container>
    <b-modal
        id="modal-center"
        centered
        title="Add a customer"
        @ok="addCustomer()"
    >
        <b-form-input v-model="customerName" placeholder="Customer name"></b-form-input>
    </b-modal>
    <b-modal
        id="project-modal"
        centered
        title="Add a project"
        @ok="addProjectForCustomer()"
    >
        <b-form-input v-model="projectName" placeholder="Project name"></b-form-input>
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
            projects: 'customers/getProjects'
        }),
        projectsByCustomer() {
            return this.projects[this.activeCustomerId]
        },
        noCustomerSelected() {
            return !this.activeCustomerId;
        },
    },
    data() {
        return {
            activeCustomerId: undefined,
            customerName: '',
            projectName: ''
        }
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    methods: {
        addCustomer() {
            const customer = {
                name: this.customerName
            }
            this.$store.dispatch('customers/addNewCustomer', customer);
            this.customerName = '';
        },
        addProjectForCustomer() {
            const project = {
                customerId: this.activeCustomerId,
                project: {
                    name: this.projectName
                }
            }
            this.$store.dispatch('customers/addProjectToCustomer', project);
        },
        getProjectForCustomer(customerId) {
            this.activeCustomerId = customerId;
            this.$store.dispatch('customers/getProjectsByCustomer', customerId);
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
    background: #ccc;
    font-size: 20px;
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

        &:focus {
            box-shadow: none;
        }
    }

    &.is-selected {
        background: #ccc;
    }
}
</style>