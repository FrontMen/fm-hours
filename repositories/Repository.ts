import {CollectionReference, DocumentData, QueryDocumentSnapshot} from '@firebase/firestore-types';
import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

type DocumentId = string;

export type {DocumentData} from '@firebase/firestore-types';

export type DocumentWithId<T extends DocumentData = DocumentData> = T & {
  id: DocumentId;
};

function includeId<T extends DocumentData>(doc: QueryDocumentSnapshot<T>): DocumentWithId<T> {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
  };
}

export default class Repository<T extends DocumentData = DocumentData> {
  collection: CollectionReference<T>;
  fireModule: typeof firebase;

  constructor(collectionKey: Collections, fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.fireModule = fireModule;
    this.collection = fire.firestore.collection(collectionKey) as CollectionReference<T>;
  }

  async add(resource: T): Promise<DocumentWithId<T>> {
    const {id} = await this.collection.add(resource as T);

    return {
      ...resource,
      id,
    };
  }

  async all(): Promise<DocumentWithId<T>[]> {
    const ref = this.collection;
    const snapshot = await ref.get();
    const docs = snapshot.docs;

    return docs.map(includeId);
  }

  async delete(id: string): Promise<void> {
    return await this.collection.doc(id).delete();
  }

  async getById(id: DocumentId): Promise<DocumentWithId<T> | null> {
    const ref = this.collection.where(this.fireModule.firestore.FieldPath.documentId(), '==', id);

    const snapshot = await ref.get();
    const doc = snapshot.docs[0];

    return doc && doc.exists ? includeId(doc) : null;
  }

  async getByIndex(index: number): Promise<DocumentWithId<T> | null> {
    const ref = this.collection;
    const snapshot = await ref.get();
    const doc = snapshot.docs[index];

    return doc && doc.exists ? includeId(doc) : null;
  }

  async updateById(id: DocumentId, resource: T): Promise<void> {
    await this.collection.doc(id).set(resource, {merge: true});
  }
}
