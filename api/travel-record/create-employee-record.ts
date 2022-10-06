import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: any, res: any) => {
  try {
    const firestore = await lazyFirestore();
    const {travelRecords, employeeId} = req.body;
    const ref = await firestore.collection(Collections.TRAVELREC);

    const updatedRecords = await Promise.all(
      travelRecords.map(async (record: any) => {
        return await updateRecord(ref, employeeId, record);
      })
    );

    const result = updatedRecords.filter((x: any) => !!x.id);
    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};

async function updateRecord(
  ref: any,
  employeeId: string,
  record: TravelRecord
): Promise<TravelRecord> {
  const {id, kilometers} = record;

  const newRecord: any = {...record};
  delete newRecord.id;

  if (id) {
    const shouldDelete = kilometers <= 0;

    if (shouldDelete) await ref.doc(id).delete();
    else await ref.doc(id).update(newRecord);

    return {
      ...newRecord,
      id: shouldDelete ? null : id,
    };
  }

  if (kilometers > 0) {
    const newDocument = await ref.add({employeeId, ...newRecord});

    return {
      ...newRecord,
      id: newDocument.id,
    };
  }

  return record;
}
