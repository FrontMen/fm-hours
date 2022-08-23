import {Collections} from '../../types/enums';
import {Timesheet} from '../../interfaces/timesheets';
import {lazyFirestore} from '../../lib/db_manager';
import {recordStatus} from '../../helpers/record-status';

export default async (req: any, res: any) => {
  const {startDate, endDate} = req.body;
  const firestore = await lazyFirestore();

  const snapshot = await firestore
    .collection(Collections.TIMESHEETS)
    .where('status', '==', recordStatus.APPROVED)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date', 'asc')
    .get();

  const result = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...(doc.data() as Omit<Timesheet, 'id'>),
  }));

  return res.status(200).json(result);
};
