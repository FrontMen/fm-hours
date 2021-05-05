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
        name,
        email,
        picture,
        projects,
        travelAllowance,
        endDate,
      } = doc.data() as Employee;

      return {
        id: doc.id,
        name,
        email,
        picture,
        projects,
        travelAllowance,
        endDate,
      };
    }

    return null;
  }

  async createEmployee(params: {
    name: string;
    email: string;
    travelAllowance: boolean;
  }): Promise<Employee> {
    const newEmployee = {
      name: params.name,
      picture: "",
      email: params.email,
      projects: [],
      travelAllowance: params.travelAllowance,
      endDate: null,
    };

    const ref = this.fire.firestore.collection("employees");
    const { id } = await ref.add(newEmployee);

    return { ...newEmployee, id };
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
