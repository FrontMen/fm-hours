import {NuxtFireInstance} from '@nuxtjs/firebase';
import {DocumentSnapshot} from '@firebase/firestore-types';

export default class EmployeesService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getEmployees() {
    const ref = this.fire.firestore.collection('employees');
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    const doc: DocumentSnapshot | null = await this.getEmployeeInformation(
      employeeId
    );

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
        bridgeUid,
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
        bridgeUid,
      };
    }

    return null;
  }

  async getEmployeeInformation(
    email: string
  ): Promise<DocumentSnapshot | null> {
    const ref = this.fire.firestore
      .collection('employees')
      .where('email', '==', email);

    const snapshot = await ref.get();

    if (!snapshot.empty) return snapshot.docs[0];

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
      picture: '',
      email: params.email,
      projects: [],
      travelAllowance: params.travelAllowance,
      endDate: null,
      startDate: params.startDate,
      created: new Date().getTime(),
    };

    const ref = this.fire.firestore.collection('employees');
    const {id} = await ref.add(newEmployee);

    return {...newEmployee, id};
  }

  async updateEmployee(employee: Employee) {
    const newEmployee = {...employee} as any;
    delete newEmployee.id;

    return await this.fire.firestore
      .collection('employees')
      .doc(employee.id)
      .set(newEmployee, {merge: true});
  }

  async deleteEmployee(id: string) {
    return await this.fire.firestore.collection('employees').doc(id).delete();
  }

  public async isAdmin(email: string) {
    const adminEmails = await this.getAdminEmails();
    return adminEmails.includes(email);
  }

  public async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection('admins');
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().admins || [];

    return result as unknown as string[];
  }

  public async getTeams(): Promise<string[]> {
    const ref = this.fire.firestore.collection('teams');
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().teams || [];

    return result as unknown as string[];
  }

  public async updateAdminEmails(adminList: string[]): Promise<string[]> {
    const docs = await this.fire.firestore.collection('admins').get();
    const docId = await docs.docs[0].id;
    const ref = await this.fire.firestore.collection('admins').doc(docId);

    await ref.update({admins: adminList});
    return adminList;
  }
}
