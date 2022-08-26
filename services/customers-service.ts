import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class CustomersService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getCustomers() {
    // we need some filter for this one
    return (await this.axios.get('api/customer/get')).data;
  }

  async getCustomersByIds(ids: Array<String>) {
    return (
      await this.axios.get('api/customer/get-by-ids', {
        params: {
          ids,
        },
      })
    ).data;
  }

  async addCustomer(customer: Omit<Customer, 'id'>) {
    return (
      await this.axios.post('api/customer/create', {
        customer,
      })
    ).data;
  }

  async getDefaultCustomers() {
    return (await this.axios.get('api/customer/get-default')).data;
  }

  async updateCustomer(customer: Customer) {
    return (
      await this.axios.post('api/customer/update', {
        customer,
      })
    ).data;
  }
}
