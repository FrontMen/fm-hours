import { NuxtFireInstance } from "@nuxtjs/firebase";
import { QuerySnapshot, DocumentSnapshot } from "@firebase/firestore-types";

import config from "~/nuxt.config";

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
    const doc: DocumentSnapshot | null = await this.getEmployeeInformation(employeeId);

    if (doc !== null && doc.exists) {
      const {
        name,
        email,
        picture,
        projects,
        travelAllowance,
        endDate,
        startDate,
        created,
      } = doc.data() as Employee;

      return {
        id: doc.id,
        name,
        email,
        picture,
        projects,
        travelAllowance,
        endDate,
        startDate,
        created,
      };
    }

    return null;
  }

  async getEmployeeInformation(employeeId: string): Promise<DocumentSnapshot | null> {
    const { isDevelopment }: any = config.publicRuntimeConfig;
    let ref;
    let snapshot: QuerySnapshot;

    if (isDevelopment) {
      const ref = this.fire.firestore
        .collection("employees")
        .where("email", "==", employeeId);

      snapshot = await ref.get();

      if (!snapshot.empty) return snapshot.docs[0];
    } else {
      ref = this.fire.firestore.collection("employees");
      return await ref.doc(employeeId).get();
    }

    return null;
  }

  async createEmployee(params: {
    name: string;
    email: string;
    travelAllowance: boolean;
    startDate: number;
  }): Promise<Employee> {
    const newEmployee = {
      name: params.name,
      picture: "",
      email: params.email,
      projects: [],
      travelAllowance: params.travelAllowance,
      endDate: null,
      startDate: params.startDate,
      created: new Date().getTime(),
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

  public async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection("admins");
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().admins || [];

    return (result as unknown) as string[];
  }
}
