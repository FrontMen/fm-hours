import type {NuxtFireInstance} from '@nuxtjs/firebase';
import type {NuxtAxiosInstance} from '@nuxtjs/axios';
import {Collections} from '~/types/enums';

export default class InsightsService {
  fire: NuxtFireInstance;
  axios: NuxtAxiosInstance;

  constructor(fire: NuxtFireInstance, axios: NuxtAxiosInstance) {
    this.fire = fire;
    this.axios = axios;
  }

  async getUsersRecords<RecordType>(
    params: {
      employeeId: string;
      startDate?: string;
      endDate?: string;
    },
    collection: string = Collections.TIMREC
  ): Promise<RecordType[]> {
    let query = this.fire.firestore
      .collection(collection)
      .where('employeeId', '==', params.employeeId);

    if (params.startDate) {
      query = query.where('date', '>=', new Date(+params.startDate).getTime());
    }

    if (params.endDate) {
      query = query.where('date', '<=', new Date(+params.endDate).getTime());
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as RecordType),
    }));
  }

  async getRecords<RecordType>(
    params: {
      startDate: Date;
      endDate: Date;
    },
    collection: string = Collections.TIMREC
  ): Promise<RecordType[]> {
    const snapshot = await this.fire.firestore
      .collection(collection)
      .where('date', '>=', params.startDate.getTime())
      .where('date', '<', params.endDate.getTime())
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as RecordType),
    }));
  }
}
