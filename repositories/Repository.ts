import {
  CollectionReference,
  DocumentData,
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  WhereFilterOp,
} from '@firebase/firestore-types';
import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

type DocumentId = string;

type DocumentField<T> = keyof T & string;

export type WhereTuple<T> = [DocumentField<T>, WhereFilterOp, any]; // TODO: stricter definition

export type OrderTuple<T> = [DocumentField<T>, OrderByDirection];

export type DocumentWithId<T extends DocumentData = DocumentData> = T & {
  id: DocumentId;
};

export type {DocumentData, OrderByDirection} from '@firebase/firestore-types';

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

  async getByIds(ids: DocumentId[]): Promise<DocumentWithId<T>[]> {
    const ref = this.collection.where(this.fireModule.firestore.FieldPath.documentId(), 'in', ids);
    const snapshot = await ref.get();
    const docs = snapshot.docs;

    return docs.map(includeId);
  }

  async getByIndex(index: number): Promise<DocumentWithId<T> | null> {
    const ref = this.collection;
    const snapshot = await ref.get();
    const doc = snapshot.docs[index];

    return doc && doc.exists ? includeId(doc) : null;
  }

  async getByQuery(
    where: WhereTuple<T>[],
    [field, direction]: OrderTuple<T> | never[] = []
  ): Promise<DocumentWithId<T>[]> {
    const selection = where.reduce(
      (acc: CollectionReference<T> | Query<T>, [field, operator, value]) =>
        acc.where(field, operator, value),
      this.collection
    );

    const ref = field && direction ? selection.orderBy(field, direction) : selection;

    const snapshot = await ref.get();
    const docs = snapshot.docs;

    return docs.map(includeId);
  }

  async updateById(id: DocumentId, resource: T): Promise<void> {
    await this.collection.doc(id).set(resource, {merge: true});
  }
}
