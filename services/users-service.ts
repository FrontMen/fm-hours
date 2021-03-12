import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class UsersService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getUsers() {
    const ref = this.fire.firestore.collection("users");
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async getUser(params: {
    userId: string;
    email: string;
  }): Promise<User | null> {
    const ref = this.fire.firestore.collection("users");
    const doc = await ref.doc(params.userId).get();

    if (doc.exists) {
      const { name, picture, travelAllowance } = doc.data() as User;

      return {
        id: doc.id,
        name,
        picture,
        travelAllowance,
      };
    }

    return null;
  }

  async createUser(params: {
    userId: string;
    name: string;
    picture: string;
  }): Promise<User> {
    const newUser = {
      name: params.name,
      picture: params.picture,
      travelAllowance: false,
    };

    const ref = this.fire.firestore.collection("users");
    await ref.doc(params.userId).set(newUser);

    return { id: params.userId, ...newUser };
  }

  async updateUser(user: User) {
    const newUser = { ...user } as any;
    delete newUser.id;

    return await this.fire.firestore
      .collection("users")
      .doc(user.id)
      .set(newUser, { merge: true });
  }

  public async isAdmin(email: string) {
    const adminEmails = await this.getAdminEmails();
    return adminEmails.includes(email);
  }

  private async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection("admins");
    const snapshot = await ref.get();
    const result = snapshot.docs[0] || [];

    return (result as unknown) as string[];
  }
}
