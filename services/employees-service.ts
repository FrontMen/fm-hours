import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class EmployeesService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getEmployees() {
    const ref = this.fire.firestore.collection("employees");
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    const ref = this.fire.firestore.collection("employees");
    const doc = await ref.doc(employeeId).get();

    if (doc.exists) {
      const {
        active,
        name,
        picture,
        projects,
        travelAllowance,
      } = doc.data() as Employee;

      return {
        id: doc.id,
        active,
        name,
        picture,
        projects,
        travelAllowance,
      };
    }

    return null;
  }

  async createEmployee(params: {
    employeeId: string;
    name: string;
    picture: string;
  }): Promise<Employee> {
    const newEmployee = {
      name: params.name,
      picture: params.picture,
      projects: [],
      active: true,
      travelAllowance: false,
    };

    const ref = this.fire.firestore.collection("employees");
    await ref.doc(params.employeeId).set(newEmployee);

    return { id: params.employeeId, ...newEmployee };
  }

  async updateEmployee(employee: Employee) {
    const newEmployee = { ...employee } as any;
    delete newEmployee.id;

    return await this.fire.firestore
      .collection("employees")
      .doc(employee.id)
      .set(newEmployee, { merge: true });
  }

  public async isAdmin(email: string) {
    const adminEmails = await this.getAdminEmails();
    return adminEmails.includes(email);
  }

  private async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection("admins");
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().admins || [];

    return (result as unknown) as string[];
  }
}
