<template>
  <div>
    <b-form-select
      v-model="selectedCustomerId"
      :options="customers"
      class="mb-3"
      @change="selectCustomer($event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    customers: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      selectedCustomerId: null
    }
  },
  methods: {
    selectCustomer (customerId) {
      this.$emit('on-customer-select', customerId)
      this.selectedProjectId = null
    }
  }
}
</script>
