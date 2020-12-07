<template>
    <div>
        <b-form-select
            :options="customers"
            class="mb-3"
            @change="selectCustomer($event)"
            v-model="selectedCustomerId"
        >
        </b-form-select>
    </div>
</template>

<script>
import { isWithinInterval } from 'date-fns';
export default {
    props: {
        customers: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            selectedCustomerId: null,
        }
    },
    methods: {
        selectCustomer: function(customerId) {
            this.$emit('on-customer-select', customerId);
            this.selectedProjectId = null;
        },
    }
};
</script>