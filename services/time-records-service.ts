import type {NuxtFireInstance} from '@nuxtjs/firebase';
import type {NuxtAxiosInstance} from '@nuxtjs/axios';
import {Collections} from '~/types/enums';

export default class RecordsService {
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
    return (
      await this.axios.get('api/time-record/get-by-employee', {
        params: {
          collection,
          employeeId: params.employeeId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      })
    ).data;
  }

  async getRecords<RecordType>(
    params: {
      startDate: Date;
      endDate: Date;
    },
    collection: string = Collections.TIMREC
  ): Promise<RecordType[]> {
    return (
      await this.axios.get('api/time-record/get', {
        params: {
          collection,
          startDate: params.startDate.getTime(),
          endDate: params.endDate.getTime(),
        },
      })
    ).data;
  }

  async addBridgeWorklogs(params: {
    employeeId: string;
    bridgeUid: string;
    timeRecords: TimeRecord[];
    contracts: number[];
  }) {
    return (
      await this.axios.post('api/bridge/worklogs', {
        timeRecords: params.timeRecords,
        contracts: params.contracts,
        bridgeUid: params.bridgeUid,
      })
    ).data;
  }

  async removeBridgeWorklogs(timeRecords: TimeRecord[]) {
    return (
      await this.axios.delete('api/bridge/worklogs', {
        data: {
          timeRecords,
        },
      })
    ).data;
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
