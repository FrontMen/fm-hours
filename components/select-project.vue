<template>
    <div>
        <b-form-select
            :options="customerList"
            @change="selectCustomer($event)"
            v-model="selectedCustomerId"
        >
        </b-form-select>
        <b-form-select
            :options="projects"
            @change="selectProject($event)"
            v-model="selectedProjectId"
        >
        </b-form-select>
    </div>
</template>

<script>
import { CreateSelectOptions } from '../helpers/create-select-options';
export default {
    computed: {
        customerList: function() {
            return CreateSelectOptions(this.customers, 'Select a customer');
        },
    },
    props: {
        customers: {
            type: Array,
            default: () => []
        },
        projects: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            selectedCustomerId: null,
            selectedProjectId: null
        }
    },
    methods: {
        selectCustomer: function(customerId) {
            this.$emit('on-customer-select', customerId);
            this.selectedProjectId = null;
        },
        selectProject: function(projectId) {
            this.$emit('on-project-select', projectId);
        },
    }
};
</script>