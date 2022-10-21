import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class EmployeesService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getEmployees(): Promise<Employee[]> {
    // paginate this
    return (await this.axios.get('api/employee/get')).data;
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    return (
      await this.axios.get('api/employee/get', {
        params: {
          employeeId,
        },
      })
    ).data;
  }

  async getEmployeeByMail(email: string): Promise<Employee | null> {
    return (
      await this.axios.get('api/employee/get', {
        params: {
          email,
        },
      })
    ).data;
  }

  async createEmployee(params: Omit<Employee, 'id' | 'picture'>): Promise<Employee> {
    return (
      await this.axios.post('api/employee/create', {
        employee: params,
      })
    ).data;
  }

  async updateEmployee(employee: Employee): Promise<void> {
    return (
      await this.axios.post('api/employee/update', {
        employee,
      })
    ).data;
  }

  async deleteEmployee(id: string): Promise<void> {
    return (
      await this.axios.delete('api/employee/delete', {
        data: {
          id,
        },
      })
    ).data;
  }

  async getTeams(): Promise<string[]> {
    return (await this.axios.get('api/employee/get-teams')).data;
  }
}
