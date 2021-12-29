import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class ContractsService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getContracts(): Promise<unknown> {
    const contractsEndpoint = 'api/bridge/contracts';

    return await this.axios.get(contractsEndpoint);
  }

  async getContract(id: number): Promise<unknown> {
    const contractEndpoint = `api/bridge/contracts/${id}`;

    return await this.axios.get(contractEndpoint);
  }
}
