import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class UsersService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async createUser(params: {
    userId: string;
    name: string;
    picture: string;
  }): Promise<User> {
    const newUser = {
      name: params.name,
      picture: params.picture,
      travelAllowence: false,
    }

    const ref = this.fire.firestore.collection("users");
    await ref.doc(params.userId).set(newUser)

    return { id: params.userId, ...newUser }
  }

  async getUser(params: {
    userId: string;
    email: string;
  }): Promise<User | null> {
    const ref = this.fire.firestore.collection("users");
    const doc = await ref.doc(params.userId).get();

    if (doc.exists) {
      const { name, picture, travelAllowence } = doc.data() as User;

      return {
        id: doc.id,
        name,
        picture,
        travelAllowence,
      };
    }

    return null;
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
