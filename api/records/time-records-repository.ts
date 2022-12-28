import type {NuxtFireInstance} from '@nuxtjs/firebase';
import type {NuxtAxiosInstance} from '@nuxtjs/axios';
import {Collections} from '~/types/enums';

export default class RecordsRepository implements IRecordsRepository {
  fire: NuxtFireInstance;
  axios: NuxtAxiosInstance;

  constructor(fire: NuxtFireInstance, axios: NuxtAxiosInstance) {
    this.fire = fire;
    this.axios = axios;
  }

  async getEmployeeRecords<RecordType>(
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

  async addBridgeWorklogs(params: {
    employeeId: string;
    bridgeUid: string;
    timeRecords: TimeRecord[];
    contracts: number[];
  }) {
    const ref = this.fire.firestore.collection(Collections.TIMREC);

    await Promise.all(
      params.timeRecords.map(async (record: TimeRecord, index) => {
        return await this.addBridgeWorklog(record, params.contracts[index], params.bridgeUid, ref);
      })
    );
  }

  async addBridgeWorklog(record: TimeRecord, contractId: number, bridgeUid: string, ref: any) {
    if (record.hours <= 0) return;
    if (!record.id) return;

    const {id} = record;
    const newRecord: any = {...record};
    delete newRecord.id;

    const {
      data: {worklogId},
    } = await this.axios.post('api/bridge/worklogs', {
      record,
      contractId,
      bridgeUid,
    });
    newRecord.worklogId = worklogId;
    await ref.doc(id).update(newRecord);
  }

  async removeBridgeWorklogs(timeRecords: TimeRecord[]) {
    const ref = this.fire.firestore.collection(Collections.TIMREC);

    await Promise.all(
      timeRecords.map(async (record: TimeRecord) => {
        return await this.removeBridgeWorklog(record, ref);
      })
    );
  }

  async removeBridgeWorklog(record: TimeRecord, ref: any) {
    if (!record.worklogId) return;

    const {id} = record;
    if (!id) return;

    await this.axios.delete(`api/bridge/worklogs/${record.worklogId}`);

    const newRecord: any = {...record};
    delete newRecord.id;
    newRecord.worklogId = null;
    return await ref.doc(id).update(newRecord);
  }

  async saveEmployeeRecords<RecordType extends {id: string | null; hours: number}>(
    params: {
      employeeId: string;
      bridgeUid?: string;
      timeRecords: RecordType[];
      contracts?: number[];
    },
    collection: string = Collections.TIMREC
  ) {
    const ref = this.fire.firestore.collection(collection);

    const updatedRecords = await Promise.all(
      params.timeRecords.map(async (timeRecord: RecordType, index) => {
        return await this.updateRecord<RecordType>(
          ref,
          params.employeeId,
          timeRecord,
          params.contracts?.[index] || -1,
          params.bridgeUid
        );
      })
    );

    return updatedRecords.filter(x => !!x.id);
  }

  private UPDATE_BRIDGE_ON_SAVE = false;

  private async updateRecord<RecordType extends {id: string | null; hours: number}>(
    ref: any,
    employeeId: string,
    record: RecordType,
    contractId: number,
    bridgeUid?: string
  ): Promise<RecordType> {
    const hasContract = contractId > -1;
    const {id, hours} = record;

    const newRecord: any = {...record};
    delete newRecord.id;

    if (id) {
      const shouldDelete = hours <= 0;
      const updateWorklog = !!newRecord.worklogId && !!bridgeUid;

      if (shouldDelete) {
        if (this.UPDATE_BRIDGE_ON_SAVE && hasContract && updateWorklog) {
          await this.axios.delete(`api/bridge/worklogs/${newRecord.worklogId}`);
        }

        await ref.doc(id).delete();
      } else {
        if (this.UPDATE_BRIDGE_ON_SAVE && hasContract && updateWorklog) {
          await this.axios.put(`api/bridge/worklogs/${newRecord.worklogId}`, {
            record: newRecord,
            bridgeUid,
          });
        }

        await ref.doc(id).update(newRecord);
      }

      return {
        ...newRecord,
        id: shouldDelete ? null : id,
      };
    }

    if (hours > 0) {
      if (this.UPDATE_BRIDGE_ON_SAVE && hasContract) {
        const {
          data: {worklogId},
        } = await this.axios.post('api/bridge/worklogs', {
          record: newRecord,
          contractId,
          bridgeUid,
        });
        newRecord.worklogId = worklogId;
      }

      const newDocument = await ref.add({employeeId, ...newRecord});

      return {
        ...newRecord,
        id: newDocument.id,
      };
    }

    return record;
  }

  async deleteEmployeeRecords<RecordType extends {id: string | null}>(
    params: {
      recordsToDelete: RecordType[];
    },
    collection: string = Collections.TIMREC
  ): Promise<void> {
    const batch = this.fire.firestore.batch();

    params.recordsToDelete.forEach(record => {
      if (record.id) {
        const ref = this.fire.firestore.collection(collection).doc(record.id!);

        batch.delete(ref);
      }
    });

    return await batch.commit();
  }
}
