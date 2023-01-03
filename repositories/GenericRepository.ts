import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

export default (collection: Collections, fire: NuxtFireInstance, fireModule: typeof firebase) => ({
  async all() {
    const ref = fire.firestore.collection(collection);
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  },

  async getById(id: string) {
    const ref = fire.firestore
      .collection(collection)
      .where(fireModule.firestore.FieldPath.documentId(), '==', id);

    const snapshot = await ref.get();
    const doc = snapshot.docs[0];

    return {
      ...doc.data(),
      id: doc.id,
    };
  },

  async getByIndex(index: number) {
    const ref = fire.firestore.collection(collection);
    const snapshot = await ref.get();
    const doc = snapshot.docs[index];

    return {
      ...doc.data(),
      id: doc.id,
    };
  },
});
