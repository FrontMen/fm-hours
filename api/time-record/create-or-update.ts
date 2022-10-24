import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {RecordType} from '../../interfaces/time-record';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(504).json({});
    }
    const {timeRecords, employeeId, contracts, bridgeUid} = req.body;
    const UPDATE_BRIDGE_ON_SAVE = false;
    const firestore = await lazyFirestore();
    const ref = firestore.collection(Collections.TIMREC);
    const updatedRecords = timeRecords.map(async (record: RecordType, index: number) => {
      const contractId = contracts?.[index] || -1;
      const hasContract = contractId > -1;
      const {id, hours} = record;
      const newRecord: any = {...record};
      delete newRecord.id;

      if (id) {
        const shouldDelete = hours <= 0;
        const updateWorklog = !!newRecord.worklogId && !!bridgeUid;

        if (shouldDelete) {
          if (UPDATE_BRIDGE_ON_SAVE && hasContract && updateWorklog) {
            await axios.delete(`api/bridge/worklogs/${newRecord.worklogId}`);
          }

          await ref.doc(id).delete();
        } else {
          if (UPDATE_BRIDGE_ON_SAVE && hasContract && updateWorklog) {
            await axios.put(`api/bridge/worklogs/${newRecord.worklogId}`, {
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
        if (UPDATE_BRIDGE_ON_SAVE && hasContract) {
          const {
            data: {worklogId},
          } = await axios.post('api/bridge/worklogs', {
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
    });

    const result = updatedRecords.filter((x: any) => !!x.id);
    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
